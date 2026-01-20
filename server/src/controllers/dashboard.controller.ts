import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';

export const getStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      responseFormatter.unauthorized(res);
      return;
    }

    // Only super_admin can access dashboard statistics
    if (currentUser.role !== 'super_admin') {
      responseFormatter.forbidden(res, 'Only super admins can access dashboard statistics');
      return;
    }

    // Get overall statistics
    const overallStats = await pool.query(`
      SELECT
        COUNT(*) as total_buildings,
        COALESCE(SUM(CAST(construction_cost AS NUMERIC)), 0) as total_construction_cost,
        COUNT(CASE WHEN building_type = 'new_building' THEN 1 END) as new_buildings_count,
        COUNT(CASE WHEN building_type = 'major_renovation' THEN 1 END) as renovation_count,
        COUNT(CASE WHEN construction_end_date IS NOT NULL AND construction_end_date < CURRENT_DATE THEN 1 END) as overdue_count
      FROM object_card
      WHERE is_deleted = FALSE
    `);

    // Get total contracts amount
    const contractsStats = await pool.query(`
      SELECT
        COUNT(*) as total_contracts,
        COALESCE(SUM(contract_amount), 0) as total_contract_amount
      FROM object_contract
      WHERE is_deleted = FALSE
    `);

    // Get statistics by construction status
    const statusStats = await pool.query(`
      SELECT
        cs.id,
        cs.name as status_name,
        COUNT(oc.id) as building_count,
        COALESCE(SUM(CAST(oc.construction_cost AS NUMERIC)), 0) as total_cost
      FROM construction_status cs
      LEFT JOIN object_card oc ON cs.id = oc.construction_status_id AND oc.is_deleted = FALSE
      WHERE cs.is_deleted = FALSE
      GROUP BY cs.id, cs.name
      ORDER BY cs.id
    `);

    // Get statistics by region
    const regionStats = await pool.query(`
      SELECT
        r.id,
        r.name as region_name,
        COUNT(oc.id) as building_count,
        COALESCE(SUM(CAST(oc.construction_cost AS NUMERIC)), 0) as total_cost,
        COUNT(CASE WHEN oc.building_type = 'new_building' THEN 1 END) as new_buildings,
        COUNT(CASE WHEN oc.building_type = 'major_renovation' THEN 1 END) as renovations
      FROM regions r
      LEFT JOIN object_card oc ON r.id = oc.region_id AND oc.is_deleted = FALSE
      WHERE r.is_deleted = FALSE
      GROUP BY r.id, r.name
      ORDER BY r.id
    `);

    // Get financial summary
    const financialStats = await pool.query(`
      SELECT
        COALESCE(SUM(CAST(oc.construction_cost AS NUMERIC)), 0) as total_budget,
        (SELECT COALESCE(SUM(contract_amount), 0) FROM object_contract WHERE is_deleted = FALSE) as total_contract_amount,
        (SELECT COALESCE(SUM(amount), 0) FROM bank_expenses WHERE is_deleted = FALSE) as total_expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE is_deleted = FALSE) as total_invoices
      FROM object_card oc
      WHERE oc.is_deleted = FALSE
    `);

    // Get all buildings with full info for dashboard
    const allBuildings = await pool.query(`
      SELECT
        oc.id,
        oc.object_name,
        oc.card_number,
        oc.building_type,
        oc.region_id,
        r.name as region_name,
        oc.construction_status_id,
        cs.name as status_name,
        oc.contractor_id,
        c.name as contractor_name,
        oc.organization_id,
        o.name as organization_name,
        oc.construction_cost,
        oc.construction_end_date,
        oc.created_at,
        CASE WHEN oc.construction_end_date IS NOT NULL AND oc.construction_end_date < CURRENT_DATE THEN true ELSE false END as is_overdue
      FROM object_card oc
      LEFT JOIN regions r ON oc.region_id = r.id
      LEFT JOIN construction_status cs ON oc.construction_status_id = cs.id
      LEFT JOIN contractor c ON oc.contractor_id = c.id
      LEFT JOIN organizations o ON oc.organization_id = o.id
      WHERE oc.is_deleted = FALSE
      ORDER BY oc.created_at DESC
    `);

    // Get monthly statistics for current year
    const monthlyStats = await pool.query(`
      SELECT
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as building_count,
        COALESCE(SUM(CAST(construction_cost AS NUMERIC)), 0) as total_cost
      FROM object_card
      WHERE is_deleted = FALSE
        AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `);

    // Get all contractors with building count
    const allContractors = await pool.query(`
      SELECT
        c.id,
        c.name as contractor_name,
        COUNT(oc.id) as building_count,
        COALESCE(SUM(CAST(oc.construction_cost AS NUMERIC)), 0) as total_cost
      FROM contractor c
      LEFT JOIN object_card oc ON c.id = oc.contractor_id AND oc.is_deleted = FALSE
      WHERE c.is_deleted = FALSE
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);

    // Get all organizations with building count
    const allOrganizations = await pool.query(`
      SELECT
        o.id,
        o.name as organization_name,
        COUNT(oc.id) as building_count,
        COALESCE(SUM(CAST(oc.construction_cost AS NUMERIC)), 0) as total_cost
      FROM organizations o
      LEFT JOIN object_card oc ON o.id = oc.organization_id AND oc.is_deleted = FALSE
      WHERE o.is_deleted = FALSE
      GROUP BY o.id, o.name
      ORDER BY o.name
    `);

    const statistics = {
      overall: {
        totalBuildings: parseInt(overallStats.rows[0].total_buildings),
        totalConstructionCost: parseFloat(overallStats.rows[0].total_construction_cost),
        newBuildingsCount: parseInt(overallStats.rows[0].new_buildings_count),
        renovationCount: parseInt(overallStats.rows[0].renovation_count),
        overdueCount: parseInt(overallStats.rows[0].overdue_count),
        totalContracts: parseInt(contractsStats.rows[0].total_contracts),
        totalContractAmount: parseFloat(contractsStats.rows[0].total_contract_amount),
      },
      byStatus: statusStats.rows.map(row => ({
        id: row.id,
        statusName: row.status_name,
        buildingCount: parseInt(row.building_count),
        totalCost: parseFloat(row.total_cost),
      })),
      byRegion: regionStats.rows.map(row => ({
        id: row.id,
        regionName: row.region_name,
        buildingCount: parseInt(row.building_count),
        totalCost: parseFloat(row.total_cost),
        newBuildings: parseInt(row.new_buildings),
        renovations: parseInt(row.renovations),
      })),
      financial: {
        totalBudget: parseFloat(financialStats.rows[0].total_budget),
        totalContractAmount: parseFloat(financialStats.rows[0].total_contract_amount),
        totalExpenses: parseFloat(financialStats.rows[0].total_expenses),
        totalInvoices: parseFloat(financialStats.rows[0].total_invoices),
      },
      buildings: allBuildings.rows.map(row => ({
        id: row.id,
        objectName: row.object_name,
        cardNumber: row.card_number,
        buildingType: row.building_type,
        regionId: row.region_id,
        regionName: row.region_name,
        statusId: row.construction_status_id,
        statusName: row.status_name,
        contractorId: row.contractor_id,
        contractorName: row.contractor_name,
        organizationId: row.organization_id,
        organizationName: row.organization_name,
        constructionCost: row.construction_cost,
        constructionEndDate: row.construction_end_date,
        isOverdue: row.is_overdue,
        createdAt: row.created_at,
      })),
      monthlyStats: monthlyStats.rows.map(row => ({
        month: parseInt(row.month),
        buildingCount: parseInt(row.building_count),
        totalCost: parseFloat(row.total_cost),
      })),
      contractors: allContractors.rows.map(row => ({
        id: row.id,
        contractorName: row.contractor_name,
        buildingCount: parseInt(row.building_count),
        totalCost: parseFloat(row.total_cost),
      })),
      organizations: allOrganizations.rows.map(row => ({
        id: row.id,
        organizationName: row.organization_name,
        buildingCount: parseInt(row.building_count),
        totalCost: parseFloat(row.total_cost),
      })),
    };

    responseFormatter.success(res, statistics, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('Get dashboard statistics error:', error);
    responseFormatter.error(res, 'Error retrieving dashboard statistics');
  }
};
