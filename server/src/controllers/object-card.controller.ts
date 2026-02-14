import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types";
import * as responseFormatter from "../utils/responseFormatter";
import {
  parsePagination,
  buildOrderClause,
  calculateMeta,
  buildSearchClause,
} from "../utils/queryBuilder";

export const getAll = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      responseFormatter.unauthorized(res);
      return;
    }

    const { page, limit, offset } = parsePagination(req.query);
    const {
      sort_by,
      sort_order,
      search,
      region_id,
      district_id,
      construction_status_id,
      contractor_id,
    } = req.query;

    const searchClause = buildSearchClause(
      [
        "object_card.object_name",
        "object_card.card_number",
        "object_card.address",
      ],
      search as string,
    );
    const orderClause = buildOrderClause(
      sort_by as string,
      sort_order as string,
    );

    let whereClause = "WHERE object_card.is_deleted = FALSE";
    const params: any[] = [];

    // Role-based filtering:
    // super_admin: can see all buildings
    // region_admin and user: can see only buildings with same organization_id
    if (currentUser.role !== "super_admin") {
      whereClause += ` AND object_card.organization_id = $${params.length + 1}`;
      params.push(currentUser.organization_id);
    }

    // Apply filters
    if (region_id) {
      whereClause += ` AND object_card.region_id = $${params.length + 1}`;
      params.push(region_id);
    }

    if (district_id) {
      whereClause += ` AND object_card.district_id = $${params.length + 1}`;
      params.push(district_id);
    }

    if (construction_status_id) {
      whereClause += ` AND object_card.construction_status_id = $${params.length + 1}`;
      params.push(construction_status_id);
    }

    if (contractor_id) {
      whereClause += ` AND object_card.contractor_id = $${params.length + 1}`;
      params.push(contractor_id);
    }

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM object_card ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        object_card.*,
        regions.name as region_name,
        districts.name as district_name,
        construction_status.name as status_name,
        contractor.name as contractor_name,
        project_organization.name as project_organization_name,
        users.name as technical_supervisor_name
       FROM object_card
       LEFT JOIN regions ON object_card.region_id = regions.id
       LEFT JOIN districts ON object_card.district_id = districts.id
       LEFT JOIN construction_status ON object_card.construction_status_id = construction_status.id
       LEFT JOIN contractor ON object_card.contractor_id = contractor.id
       LEFT JOIN project_organization ON object_card.project_organization_id = project_organization.id
       LEFT JOIN users ON object_card.technical_supervisor_id = users.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );

    responseFormatter.success(
      res,
      result.rows,
      "Object cards retrieved successfully",
      200,
      calculateMeta(page, limit, total),
    );
  } catch (error) {
    console.error("Get object cards error:", error);
    responseFormatter.error(res, "Error retrieving object cards");
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        object_card.*,
        regions.name as region_name,
        districts.name as district_name,
        construction_status.name as status_name,
        contractor.name as contractor_name,
        contractor.tax_id as contractor_tax_id,
        contractor.address as contractor_address,
        contractor.phone_number as contractor_phone,
        project_organization.name as project_organization_name,
        project_organization.tax_id as project_org_tax_id,
        project_organization.address as project_org_address,
        project_organization.phone_number as project_org_phone,
        users.name as technical_supervisor_name,
        users.username as technical_supervisor_username,
        users.email as technical_supervisor_email
       FROM object_card
       LEFT JOIN regions ON object_card.region_id = regions.id
       LEFT JOIN districts ON object_card.district_id = districts.id
       LEFT JOIN construction_status ON object_card.construction_status_id = construction_status.id
       LEFT JOIN contractor ON object_card.contractor_id = contractor.id
       LEFT JOIN project_organization ON object_card.project_organization_id = project_organization.id
       LEFT JOIN users ON object_card.technical_supervisor_id = users.id
       WHERE object_card.id = $1 AND object_card.is_deleted = FALSE`,
      [id],
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, "Object card not found");
      return;
    }

    responseFormatter.success(
      res,
      result.rows[0],
      "Object card retrieved successfully",
    );
  } catch (error) {
    console.error("Get object card error:", error);
    responseFormatter.error(res, "Error retrieving object card");
  }
};

export const getSummary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get main object card data
    const objectCardResult = await pool.query(
      `SELECT
        object_card.*,
        regions.name as region_name,
        districts.name as district_name,
        construction_status.name as status_name,
        contractor.name as contractor_name,
        contractor.tax_id as contractor_tax_id,
        contractor.address as contractor_address,
        contractor.phone_number as contractor_phone,
        contractor.mfo as contractor_mfo,
        project_organization.name as project_organization_name,
        project_organization.tax_id as project_org_tax_id,
        project_organization.address as project_org_address,
        project_organization.phone_number as project_org_phone,
        project_organization.mfo as project_org_mfo,
        users.name as technical_supervisor_name,
        users.username as technical_supervisor_username,
        users.email as technical_supervisor_email,
        users.phone_number as technical_supervisor_phone
       FROM object_card
       LEFT JOIN regions ON object_card.region_id = regions.id
       LEFT JOIN districts ON object_card.district_id = districts.id
       LEFT JOIN construction_status ON object_card.construction_status_id = construction_status.id
       LEFT JOIN contractor ON object_card.contractor_id = contractor.id
       LEFT JOIN project_organization ON object_card.project_organization_id = project_organization.id
       LEFT JOIN users ON object_card.technical_supervisor_id = users.id
       WHERE object_card.id = $1 AND object_card.is_deleted = FALSE`,
      [id],
    );

    if (objectCardResult.rows.length === 0) {
      responseFormatter.notFound(res, "Object card not found");
      return;
    }

    const objectCard = objectCardResult.rows[0];

    // Get contracts
    const contractsResult = await pool.query(
      `SELECT * FROM object_contract
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY contract_date DESC`,
      [id],
    );

    // Get estimates
    const estimatesResult = await pool.query(
      `SELECT * FROM object_estimate
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY year DESC`,
      [id],
    );

    // Get sub-objects with their items
    const subObjectsResult = await pool.query(
      `SELECT * FROM sub_object_card
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY deadline ASC`,
      [id],
    );

    // For each sub-object, get its items
    const subObjectsWithItems = await Promise.all(
      subObjectsResult.rows.map(async (subObject) => {
        const itemsResult = await pool.query(
          `SELECT
            sub_object_card_item.*,
            construction_items.name as item_name
           FROM sub_object_card_item
           LEFT JOIN construction_items ON sub_object_card_item.construction_item_id = construction_items.id
           WHERE sub_object_card_item.sub_object_card_id = $1 AND sub_object_card_item.is_deleted = FALSE
           ORDER BY sub_object_card_item.deadline ASC`,
          [subObject.id],
        );
        return {
          ...subObject,
          items: itemsResult.rows,
        };
      }),
    );

    // Get bank expenses
    const expensesResult = await pool.query(
      `SELECT * FROM bank_expenses
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY registry_date DESC`,
      [id],
    );

    // Get invoices
    const invoicesResult = await pool.query(
      `SELECT * FROM invoices
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY document_date DESC`,
      [id],
    );

    // Get files
    const filesResult = await pool.query(
      `SELECT * FROM files
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY created_at DESC`,
      [id],
    );

    // Get building images
    const imagesResult = await pool.query(
      `SELECT * FROM building_images
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY sort_order ASC, created_at ASC`,
      [id],
    );

    // Calculate financial summary
    const totalContractAmount = contractsResult.rows.reduce(
      (sum, contract) => sum + (parseFloat(contract.contract_amount) || 0),
      0,
    );

    const totalExpenses = expensesResult.rows.reduce(
      (sum, expense) => sum + (parseFloat(expense.amount) || 0),
      0,
    );

    const totalInvoices = invoicesResult.rows.reduce(
      (sum, invoice) => sum + (parseFloat(invoice.amount) || 0),
      0,
    );

    const summary = {
      objectCard,
      contracts: contractsResult.rows,
      estimates: estimatesResult.rows,
      subObjects: subObjectsWithItems,
      bankExpenses: expensesResult.rows,
      invoices: invoicesResult.rows,
      files: filesResult.rows,
      images: imagesResult.rows,
      financialSummary: {
        constructionCost: parseFloat(objectCard.construction_cost) || 0,
        totalContractAmount,
        totalExpenses,
        totalInvoices,
        balance: totalContractAmount - totalExpenses,
      },
      counts: {
        contracts: contractsResult.rows.length,
        estimates: estimatesResult.rows.length,
        subObjects: subObjectsResult.rows.length,
        expenses: expensesResult.rows.length,
        invoices: invoicesResult.rows.length,
        files: filesResult.rows.length,
      },
    };

    responseFormatter.success(
      res,
      summary,
      "Object card summary retrieved successfully",
    );
  } catch (error) {
    console.error("Get object card summary error:", error);
    responseFormatter.error(res, "Error retrieving object card summary");
  }
};

export const create = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      card_number,
      object_name,
      address,
      region_id,
      district_id,
      construction_basis,
      project_organization_id,
      object_passport,
      contractor_id,
      technical_supervisor_id,
      construction_start_date,
      construction_end_date,
      construction_status_id,
      construction_cost,
      organization_id,
      building_type,
      camera_login,
      camera_password,
      camera_ip,
    } = req.body;

    // Validate contractor exists
    const contractorCheck = await pool.query(
      "SELECT id FROM contractor WHERE id = $1 AND is_deleted = FALSE",
      [contractor_id],
    );
    if (contractorCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid contractor ID");
      return;
    }

    // Validate construction status exists
    const statusCheck = await pool.query(
      "SELECT id FROM construction_status WHERE id = $1 AND is_deleted = FALSE",
      [construction_status_id],
    );
    if (statusCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid construction status ID");
      return;
    }

    // Validate technical supervisor if provided
    if (technical_supervisor_id) {
      const supervisorCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND is_deleted = FALSE",
        [technical_supervisor_id],
      );
      if (supervisorCheck.rows.length === 0) {
        responseFormatter.badRequest(res, "Invalid technical supervisor ID");
        return;
      }
    }

    // Validate organization exists
    const organizationCheck = await pool.query(
      "SELECT id FROM organizations WHERE id = $1 AND is_deleted = FALSE",
      [organization_id],
    );
    if (organizationCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid organization ID");
      return;
    }

    // Check for duplicate card_number if provided
    if (card_number) {
      const cardNumberCheck = await pool.query(
        "SELECT id FROM object_card WHERE card_number = $1 AND is_deleted = FALSE",
        [card_number],
      );
      if (cardNumberCheck.rows.length > 0) {
        responseFormatter.conflict(
          res,
          "Object card with this card number already exists",
        );
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO object_card (
        card_number, object_name, address, region_id, district_id, construction_basis,
        project_organization_id, object_passport, contractor_id, technical_supervisor_id,
        construction_start_date, construction_end_date, construction_status_id, construction_cost, organization_id, building_type,
        camera_login, camera_password, camera_ip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        card_number || null,
        object_name,
        address || null,
        region_id,
        district_id,
        construction_basis || null,
        project_organization_id,
        object_passport || null,
        contractor_id,
        technical_supervisor_id || null,
        construction_start_date || null,
        construction_end_date || null,
        construction_status_id,
        construction_cost || null,
        organization_id,
        building_type || "new_building",
        camera_login || null,
        camera_password || null,
        camera_ip || null,
      ],
    );

    responseFormatter.created(
      res,
      result.rows[0],
      "Object card created successfully",
    );
  } catch (error) {
    console.error("Create object card error:", error);
    responseFormatter.error(res, "Error creating object card");
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      card_number,
      object_name,
      address,
      region_id,
      district_id,
      construction_basis,
      project_organization_id,
      object_passport,
      contractor_id,
      technical_supervisor_id,
      construction_start_date,
      construction_end_date,
      construction_status_id,
      construction_cost,
      organization_id,
      building_type,
      camera_login,
      camera_password,
      camera_ip,
    } = req.body;

    // Validate required fields
    if (
      !object_name ||
      !region_id ||
      !district_id ||
      !project_organization_id ||
      !contractor_id ||
      !construction_status_id ||
      !organization_id
    ) {
      responseFormatter.badRequest(
        res,
        "Object name, region, district, project organization, contractor, organization, and status are required",
      );
      return;
    }

    // Validate all foreign keys (similar to create)
    const regionCheck = await pool.query(
      "SELECT id FROM regions WHERE id = $1 AND is_deleted = FALSE",
      [region_id],
    );
    if (regionCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid region ID");
      return;
    }

    const districtCheck = await pool.query(
      "SELECT id FROM districts WHERE id = $1 AND is_deleted = FALSE",
      [district_id],
    );
    if (districtCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid district ID");
      return;
    }

    const projectOrgCheck = await pool.query(
      "SELECT id FROM project_organization WHERE id = $1 AND is_deleted = FALSE",
      [project_organization_id],
    );
    if (projectOrgCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid project organization ID");
      return;
    }

    const contractorCheck = await pool.query(
      "SELECT id FROM contractor WHERE id = $1 AND is_deleted = FALSE",
      [contractor_id],
    );
    if (contractorCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid contractor ID");
      return;
    }

    const statusCheck = await pool.query(
      "SELECT id FROM construction_status WHERE id = $1 AND is_deleted = FALSE",
      [construction_status_id],
    );
    if (statusCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid construction status ID");
      return;
    }

    if (technical_supervisor_id) {
      const supervisorCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND is_deleted = FALSE",
        [technical_supervisor_id],
      );
      if (supervisorCheck.rows.length === 0) {
        responseFormatter.badRequest(res, "Invalid technical supervisor ID");
        return;
      }
    }

    // Validate organization exists
    const organizationCheck = await pool.query(
      "SELECT id FROM organizations WHERE id = $1 AND is_deleted = FALSE",
      [organization_id],
    );
    if (organizationCheck.rows.length === 0) {
      responseFormatter.badRequest(res, "Invalid organization ID");
      return;
    }

    // Check for duplicate card_number if provided (excluding current card)
    if (card_number) {
      const cardNumberCheck = await pool.query(
        "SELECT id FROM object_card WHERE card_number = $1 AND id != $2 AND is_deleted = FALSE",
        [card_number, id],
      );
      if (cardNumberCheck.rows.length > 0) {
        responseFormatter.conflict(
          res,
          "Object card with this card number already exists",
        );
        return;
      }
    }

    const result = await pool.query(
      `UPDATE object_card SET
        card_number = $1, object_name = $2, address = $3, region_id = $4, district_id = $5,
        construction_basis = $6, project_organization_id = $7, object_passport = $8,
        contractor_id = $9, technical_supervisor_id = $10, construction_start_date = $11,
        construction_end_date = $12, construction_status_id = $13, construction_cost = $14, organization_id = $15, building_type = $16,
        camera_login = $17, camera_password = $18, camera_ip = $19
       WHERE id = $20 AND is_deleted = FALSE
       RETURNING *`,
      [
        card_number || null,
        object_name,
        address || null,
        region_id,
        district_id,
        construction_basis || null,
        project_organization_id,
        object_passport || null,
        contractor_id,
        technical_supervisor_id || null,
        construction_start_date || null,
        construction_end_date || null,
        construction_status_id,
        construction_cost || null,
        organization_id,
        building_type || "new_building",
        camera_login || null,
        camera_password || null,
        camera_ip || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, "Object card not found");
      return;
    }

    responseFormatter.success(
      res,
      result.rows[0],
      "Object card updated successfully",
    );
  } catch (error) {
    console.error("Update object card error:", error);
    responseFormatter.error(res, "Error updating object card");
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE object_card SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, "Object card not found");
      return;
    }

    responseFormatter.success(res, null, "Object card deleted successfully");
  } catch (error) {
    console.error("Delete object card error:", error);
    responseFormatter.error(res, "Error deleting object card");
  }
};
