import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, year } = req.query;

    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE object_estimate.is_deleted = FALSE';
    const params: any[] = [];

    // Filter by year if provided
    if (year) {
      whereClause += ` AND object_estimate.year = $${params.length + 1}`;
      params.push(year);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM object_estimate ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        object_estimate.*,
        object_card.object_name,
        object_card.card_number,
        object_contract.contract_number,
        object_contract.contract_amount
       FROM object_estimate
       LEFT JOIN object_card ON object_estimate.object_card_id = object_card.id
       LEFT JOIN object_contract ON object_estimate.object_contract_id = object_contract.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Calculate total for each estimate
    const estimatesWithTotals = result.rows.map((estimate) => {
      const yearTotal =
        (parseFloat(estimate.month_1) || 0) +
        (parseFloat(estimate.month_2) || 0) +
        (parseFloat(estimate.month_3) || 0) +
        (parseFloat(estimate.month_4) || 0) +
        (parseFloat(estimate.month_5) || 0) +
        (parseFloat(estimate.month_6) || 0) +
        (parseFloat(estimate.month_7) || 0) +
        (parseFloat(estimate.month_8) || 0) +
        (parseFloat(estimate.month_9) || 0) +
        (parseFloat(estimate.month_10) || 0) +
        (parseFloat(estimate.month_11) || 0) +
        (parseFloat(estimate.month_12) || 0);

      return {
        ...estimate,
        year_total: yearTotal,
      };
    });

    responseFormatter.success(res, estimatesWithTotals, 'Estimates retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get estimates error:', error);
    responseFormatter.error(res, 'Error retrieving estimates');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        object_estimate.*,
        object_card.object_name,
        object_card.card_number,
        object_card.construction_cost,
        object_contract.contract_number,
        object_contract.contract_amount,
        object_contract.contract_date
       FROM object_estimate
       LEFT JOIN object_card ON object_estimate.object_card_id = object_card.id
       LEFT JOIN object_contract ON object_estimate.object_contract_id = object_contract.id
       WHERE object_estimate.id = $1 AND object_estimate.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Estimate not found');
      return;
    }

    const estimate = result.rows[0];

    // Calculate year total
    const yearTotal =
      (parseFloat(estimate.month_1) || 0) +
      (parseFloat(estimate.month_2) || 0) +
      (parseFloat(estimate.month_3) || 0) +
      (parseFloat(estimate.month_4) || 0) +
      (parseFloat(estimate.month_5) || 0) +
      (parseFloat(estimate.month_6) || 0) +
      (parseFloat(estimate.month_7) || 0) +
      (parseFloat(estimate.month_8) || 0) +
      (parseFloat(estimate.month_9) || 0) +
      (parseFloat(estimate.month_10) || 0) +
      (parseFloat(estimate.month_11) || 0) +
      (parseFloat(estimate.month_12) || 0);

    responseFormatter.success(res, { ...estimate, year_total: yearTotal }, 'Estimate retrieved successfully');
  } catch (error) {
    console.error('Get estimate error:', error);
    responseFormatter.error(res, 'Error retrieving estimate');
  }
};

export const getByObjectCardId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    // Verify object card exists
    const objectCardCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    if (objectCardCheck.rows.length === 0) {
      responseFormatter.notFound(res, 'Object card not found');
      return;
    }

    const result = await pool.query(
      `SELECT
        object_estimate.*,
        object_contract.contract_number
       FROM object_estimate
       LEFT JOIN object_contract ON object_estimate.object_contract_id = object_contract.id
       WHERE object_estimate.object_card_id = $1 AND object_estimate.is_deleted = FALSE
       ORDER BY year DESC`,
      [objectCardId]
    );

    // Calculate totals for each estimate
    const estimatesWithTotals = result.rows.map((estimate) => {
      const yearTotal =
        (parseFloat(estimate.month_1) || 0) +
        (parseFloat(estimate.month_2) || 0) +
        (parseFloat(estimate.month_3) || 0) +
        (parseFloat(estimate.month_4) || 0) +
        (parseFloat(estimate.month_5) || 0) +
        (parseFloat(estimate.month_6) || 0) +
        (parseFloat(estimate.month_7) || 0) +
        (parseFloat(estimate.month_8) || 0) +
        (parseFloat(estimate.month_9) || 0) +
        (parseFloat(estimate.month_10) || 0) +
        (parseFloat(estimate.month_11) || 0) +
        (parseFloat(estimate.month_12) || 0);

      return {
        ...estimate,
        year_total: yearTotal,
      };
    });

    responseFormatter.success(res, estimatesWithTotals, 'Estimates retrieved successfully');
  } catch (error) {
    console.error('Get estimates by object card error:', error);
    responseFormatter.error(res, 'Error retrieving estimates');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      object_card_id,
      object_contract_id,
      year,
      month_1, month_2, month_3, month_4, month_5, month_6,
      month_7, month_8, month_9, month_10, month_11, month_12,
    } = req.body;

    if (!object_card_id || !object_contract_id || !year) {
      responseFormatter.badRequest(res, 'Object card ID, contract ID, and year are required');
      return;
    }

    // Verify object card exists
    const objectCardCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [object_card_id]
    );

    if (objectCardCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid object card ID');
      return;
    }

    // Verify contract exists and belongs to the object card
    const contractCheck = await pool.query(
      'SELECT id FROM object_contract WHERE id = $1 AND object_card_id = $2 AND is_deleted = FALSE',
      [object_contract_id, object_card_id]
    );

    if (contractCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid contract ID or contract does not belong to this object card');
      return;
    }

    // Check for duplicate year for the same contract
    const duplicateCheck = await pool.query(
      'SELECT id FROM object_estimate WHERE object_card_id = $1 AND object_contract_id = $2 AND year = $3 AND is_deleted = FALSE',
      [object_card_id, object_contract_id, year]
    );

    if (duplicateCheck.rows.length > 0) {
      responseFormatter.conflict(res, 'Estimate for this year already exists for this contract');
      return;
    }

    const result = await pool.query(
      `INSERT INTO object_estimate (
        object_card_id, object_contract_id, year,
        month_1, month_2, month_3, month_4, month_5, month_6,
        month_7, month_8, month_9, month_10, month_11, month_12
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        object_card_id, object_contract_id, year,
        month_1 || 0, month_2 || 0, month_3 || 0, month_4 || 0,
        month_5 || 0, month_6 || 0, month_7 || 0, month_8 || 0,
        month_9 || 0, month_10 || 0, month_11 || 0, month_12 || 0,
      ]
    );

    responseFormatter.created(res, result.rows[0], 'Estimate created successfully');
  } catch (error) {
    console.error('Create estimate error:', error);
    responseFormatter.error(res, 'Error creating estimate');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      object_card_id,
      object_contract_id,
      year,
      month_1, month_2, month_3, month_4, month_5, month_6,
      month_7, month_8, month_9, month_10, month_11, month_12,
    } = req.body;

    if (!object_card_id || !object_contract_id || !year) {
      responseFormatter.badRequest(res, 'Object card ID, contract ID, and year are required');
      return;
    }

    // Verify object card exists
    const objectCardCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [object_card_id]
    );

    if (objectCardCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid object card ID');
      return;
    }

    // Verify contract exists and belongs to the object card
    const contractCheck = await pool.query(
      'SELECT id FROM object_contract WHERE id = $1 AND object_card_id = $2 AND is_deleted = FALSE',
      [object_contract_id, object_card_id]
    );

    if (contractCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid contract ID or contract does not belong to this object card');
      return;
    }

    // Check for duplicate year (excluding current estimate)
    const duplicateCheck = await pool.query(
      'SELECT id FROM object_estimate WHERE object_card_id = $1 AND object_contract_id = $2 AND year = $3 AND id != $4 AND is_deleted = FALSE',
      [object_card_id, object_contract_id, year, id]
    );

    if (duplicateCheck.rows.length > 0) {
      responseFormatter.conflict(res, 'Estimate for this year already exists for this contract');
      return;
    }

    const result = await pool.query(
      `UPDATE object_estimate SET
        object_card_id = $1, object_contract_id = $2, year = $3,
        month_1 = $4, month_2 = $5, month_3 = $6, month_4 = $7,
        month_5 = $8, month_6 = $9, month_7 = $10, month_8 = $11,
        month_9 = $12, month_10 = $13, month_11 = $14, month_12 = $15
       WHERE id = $16 AND is_deleted = FALSE
       RETURNING *`,
      [
        object_card_id, object_contract_id, year,
        month_1 || 0, month_2 || 0, month_3 || 0, month_4 || 0,
        month_5 || 0, month_6 || 0, month_7 || 0, month_8 || 0,
        month_9 || 0, month_10 || 0, month_11 || 0, month_12 || 0,
        id,
      ]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Estimate not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Estimate updated successfully');
  } catch (error) {
    console.error('Update estimate error:', error);
    responseFormatter.error(res, 'Error updating estimate');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE object_estimate SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Estimate not found');
      return;
    }

    responseFormatter.success(res, null, 'Estimate deleted successfully');
  } catch (error) {
    console.error('Delete estimate error:', error);
    responseFormatter.error(res, 'Error deleting estimate');
  }
};
