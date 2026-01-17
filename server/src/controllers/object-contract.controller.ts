import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search } = req.query;

    const searchClause = buildSearchClause(['contract_number'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE object_contract.is_deleted = FALSE';
    const params: any[] = [];

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM object_contract ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        object_contract.*,
        object_card.object_name,
        object_card.card_number
       FROM object_contract
       LEFT JOIN object_card ON object_contract.object_card_id = object_card.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Contracts retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get contracts error:', error);
    responseFormatter.error(res, 'Error retrieving contracts');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        object_contract.*,
        object_card.object_name,
        object_card.card_number,
        object_card.address,
        object_card.construction_cost
       FROM object_contract
       LEFT JOIN object_card ON object_contract.object_card_id = object_card.id
       WHERE object_contract.id = $1 AND object_contract.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Contract not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Contract retrieved successfully');
  } catch (error) {
    console.error('Get contract error:', error);
    responseFormatter.error(res, 'Error retrieving contract');
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
      `SELECT * FROM object_contract
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY contract_date DESC`,
      [objectCardId]
    );

    responseFormatter.success(res, result.rows, 'Contracts retrieved successfully');
  } catch (error) {
    console.error('Get contracts by object card error:', error);
    responseFormatter.error(res, 'Error retrieving contracts');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { object_card_id, contract_number, contract_date, contract_amount, stage } = req.body;

    if (!object_card_id) {
      responseFormatter.badRequest(res, 'Object card ID is required');
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

    // Check for duplicate contract_number if provided
    if (contract_number) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM object_contract WHERE contract_number = $1 AND object_card_id = $2 AND is_deleted = FALSE',
        [contract_number, object_card_id]
      );

      if (duplicateCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Contract with this number already exists for this object card');
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO object_contract (object_card_id, contract_number, contract_date, contract_amount, stage)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [object_card_id, contract_number || null, contract_date || null, contract_amount || null, stage || null]
    );

    responseFormatter.created(res, result.rows[0], 'Contract created successfully');
  } catch (error) {
    console.error('Create contract error:', error);
    responseFormatter.error(res, 'Error creating contract');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { object_card_id, contract_number, contract_date, contract_amount, stage } = req.body;

    if (!object_card_id) {
      responseFormatter.badRequest(res, 'Object card ID is required');
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

    // Check for duplicate contract_number if provided (excluding current contract)
    if (contract_number) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM object_contract WHERE contract_number = $1 AND object_card_id = $2 AND id != $3 AND is_deleted = FALSE',
        [contract_number, object_card_id, id]
      );

      if (duplicateCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Contract with this number already exists for this object card');
        return;
      }
    }

    const result = await pool.query(
      `UPDATE object_contract
       SET object_card_id = $1, contract_number = $2, contract_date = $3, contract_amount = $4, stage = $5
       WHERE id = $6 AND is_deleted = FALSE
       RETURNING *`,
      [object_card_id, contract_number || null, contract_date || null, contract_amount || null, stage || null, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Contract not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Contract updated successfully');
  } catch (error) {
    console.error('Update contract error:', error);
    responseFormatter.error(res, 'Error updating contract');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if contract has estimates
    const estimatesCheck = await pool.query(
      'SELECT COUNT(*) FROM object_estimate WHERE object_contract_id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (parseInt(estimatesCheck.rows[0].count) > 0) {
      responseFormatter.badRequest(res, 'Cannot delete contract with existing estimates');
      return;
    }

    const result = await pool.query(
      'UPDATE object_contract SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Contract not found');
      return;
    }

    responseFormatter.success(res, null, 'Contract deleted successfully');
  } catch (error) {
    console.error('Delete contract error:', error);
    responseFormatter.error(res, 'Error deleting contract');
  }
};
