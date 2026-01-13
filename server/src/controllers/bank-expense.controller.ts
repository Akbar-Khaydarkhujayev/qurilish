import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search, start_date, end_date } = req.query;

    const searchClause = buildSearchClause(['registry_number', 'description'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE bank_expenses.is_deleted = FALSE';
    const params: any[] = [];

    // Filter by date range
    if (start_date) {
      whereClause += ` AND bank_expenses.registry_date >= $${params.length + 1}`;
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ` AND bank_expenses.registry_date <= $${params.length + 1}`;
      params.push(end_date);
    }

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM bank_expenses ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        bank_expenses.*,
        object_card.object_name,
        object_card.card_number,
        object_contract.contract_number,
        object_contract.contract_date
       FROM bank_expenses
       LEFT JOIN object_card ON bank_expenses.object_card_id = object_card.id
       LEFT JOIN object_contract ON bank_expenses.object_contract_id = object_contract.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Calculate total amount
    const totalAmountResult = await pool.query(
      `SELECT SUM(amount) as total_amount FROM bank_expenses ${whereClause}`,
      params
    );

    const totalAmount = parseFloat(totalAmountResult.rows[0].total_amount) || 0;

    responseFormatter.success(
      res,
      {
        expenses: result.rows,
        totalAmount,
      },
      'Bank expenses retrieved successfully',
      200,
      calculateMeta(page, limit, total)
    );
  } catch (error) {
    console.error('Get bank expenses error:', error);
    responseFormatter.error(res, 'Error retrieving bank expenses');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        bank_expenses.*,
        object_card.object_name,
        object_card.card_number,
        object_card.address,
        object_card.construction_cost,
        object_contract.contract_number,
        object_contract.contract_date,
        object_contract.contract_amount
       FROM bank_expenses
       LEFT JOIN object_card ON bank_expenses.object_card_id = object_card.id
       LEFT JOIN object_contract ON bank_expenses.object_contract_id = object_contract.id
       WHERE bank_expenses.id = $1 AND bank_expenses.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Bank expense not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Bank expense retrieved successfully');
  } catch (error) {
    console.error('Get bank expense error:', error);
    responseFormatter.error(res, 'Error retrieving bank expense');
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
      `SELECT * FROM bank_expenses
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY registry_date DESC NULLS LAST`,
      [objectCardId]
    );

    // Calculate total amount for this object card
    const totalAmountResult = await pool.query(
      `SELECT SUM(amount) as total_amount
       FROM bank_expenses
       WHERE object_card_id = $1 AND is_deleted = FALSE`,
      [objectCardId]
    );

    const totalAmount = parseFloat(totalAmountResult.rows[0].total_amount) || 0;

    responseFormatter.success(
      res,
      {
        expenses: result.rows,
        totalAmount,
        count: result.rows.length,
      },
      'Bank expenses retrieved successfully'
    );
  } catch (error) {
    console.error('Get bank expenses by object card error:', error);
    responseFormatter.error(res, 'Error retrieving bank expenses');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { object_card_id, object_contract_id, registry_number, registry_date, amount, description } = req.body;

    if (!object_card_id || !object_contract_id) {
      responseFormatter.badRequest(res, 'Object card ID and object contract ID are required');
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

    // Verify object contract exists and belongs to the object card
    const contractCheck = await pool.query(
      'SELECT id FROM object_contract WHERE id = $1 AND object_card_id = $2 AND is_deleted = FALSE',
      [object_contract_id, object_card_id]
    );

    if (contractCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid object contract ID or contract does not belong to this object card');
      return;
    }

    // Validate amount is positive if provided
    if (amount !== undefined && amount !== null && parseFloat(amount) < 0) {
      responseFormatter.badRequest(res, 'Amount must be a positive number');
      return;
    }

    // Check for duplicate registry_number if provided
    if (registry_number) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM bank_expenses WHERE registry_number = $1 AND object_card_id = $2 AND is_deleted = FALSE',
        [registry_number, object_card_id]
      );

      if (duplicateCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Expense with this registry number already exists for this object card');
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO bank_expenses (object_card_id, object_contract_id, registry_number, registry_date, amount, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        object_card_id,
        object_contract_id,
        registry_number || null,
        registry_date || null,
        amount || null,
        description || null,
      ]
    );

    responseFormatter.created(res, result.rows[0], 'Bank expense created successfully');
  } catch (error) {
    console.error('Create bank expense error:', error);
    responseFormatter.error(res, 'Error creating bank expense');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { object_card_id, object_contract_id, registry_number, registry_date, amount, description } = req.body;

    if (!object_card_id || !object_contract_id) {
      responseFormatter.badRequest(res, 'Object card ID and object contract ID are required');
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

    // Verify object contract exists and belongs to the object card
    const contractCheck = await pool.query(
      'SELECT id FROM object_contract WHERE id = $1 AND object_card_id = $2 AND is_deleted = FALSE',
      [object_contract_id, object_card_id]
    );

    if (contractCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid object contract ID or contract does not belong to this object card');
      return;
    }

    // Validate amount is positive if provided
    if (amount !== undefined && amount !== null && parseFloat(amount) < 0) {
      responseFormatter.badRequest(res, 'Amount must be a positive number');
      return;
    }

    // Check for duplicate registry_number if provided (excluding current expense)
    if (registry_number) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM bank_expenses WHERE registry_number = $1 AND object_card_id = $2 AND id != $3 AND is_deleted = FALSE',
        [registry_number, object_card_id, id]
      );

      if (duplicateCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Expense with this registry number already exists for this object card');
        return;
      }
    }

    const result = await pool.query(
      `UPDATE bank_expenses
       SET object_card_id = $1, object_contract_id = $2, registry_number = $3, registry_date = $4, amount = $5, description = $6
       WHERE id = $7 AND is_deleted = FALSE
       RETURNING *`,
      [
        object_card_id,
        object_contract_id,
        registry_number || null,
        registry_date || null,
        amount || null,
        description || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Bank expense not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Bank expense updated successfully');
  } catch (error) {
    console.error('Update bank expense error:', error);
    responseFormatter.error(res, 'Error updating bank expense');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE bank_expenses SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Bank expense not found');
      return;
    }

    responseFormatter.success(res, null, 'Bank expense deleted successfully');
  } catch (error) {
    console.error('Delete bank expense error:', error);
    responseFormatter.error(res, 'Error deleting bank expense');
  }
};
