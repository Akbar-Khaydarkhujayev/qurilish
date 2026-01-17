import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search } = req.query;

    const searchClause = buildSearchClause(['sub_object_card.name'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE sub_object_card.is_deleted = FALSE';
    const params: any[] = [];

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM sub_object_card ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        sub_object_card.*,
        object_card.object_name,
        object_card.card_number
       FROM sub_object_card
       LEFT JOIN object_card ON sub_object_card.object_card_id = object_card.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Sub-object cards retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get sub-object cards error:', error);
    responseFormatter.error(res, 'Error retrieving sub-object cards');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        sub_object_card.*,
        object_card.object_name,
        object_card.card_number,
        object_card.address
       FROM sub_object_card
       LEFT JOIN object_card ON sub_object_card.object_card_id = object_card.id
       WHERE sub_object_card.id = $1 AND sub_object_card.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card not found');
      return;
    }

    // Get items count, total cost and average completion percentage for this sub-object
    const itemsResult = await pool.query(
      `SELECT
        COUNT(*) as items_count,
        COALESCE(SUM(cost), 0) as total_cost,
        CASE
          WHEN COUNT(*) > 0 THEN ROUND(AVG(COALESCE(completion_percentage, 0)))
          ELSE 0
        END as avg_completion_percentage
       FROM sub_object_card_item
       WHERE sub_object_card_id = $1 AND is_deleted = FALSE`,
      [id]
    );

    const itemsData = itemsResult.rows[0];
    const hasItems = parseInt(itemsData.items_count) > 0;
    const subObject = result.rows[0];

    responseFormatter.success(res, {
      ...subObject,
      items_count: parseInt(itemsData.items_count),
      // Use calculated values from children if items exist, otherwise use sub-object's own values
      cost: hasItems ? parseFloat(itemsData.total_cost) : subObject.cost,
      completion_percentage: hasItems ? parseInt(itemsData.avg_completion_percentage) : subObject.completion_percentage,
    }, 'Sub-object card retrieved successfully');
  } catch (error) {
    console.error('Get sub-object card error:', error);
    responseFormatter.error(res, 'Error retrieving sub-object card');
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
      `SELECT * FROM sub_object_card
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY deadline ASC NULLS LAST`,
      [objectCardId]
    );

    // Get items count, calculated cost and completion percentage for each sub-object
    const subObjectsWithCalculations = await Promise.all(
      result.rows.map(async (subObject) => {
        const itemsResult = await pool.query(
          `SELECT
            COUNT(*) as items_count,
            COALESCE(SUM(cost), 0) as total_cost,
            CASE
              WHEN COUNT(*) > 0 THEN ROUND(AVG(COALESCE(completion_percentage, 0)))
              ELSE 0
            END as avg_completion_percentage
           FROM sub_object_card_item
           WHERE sub_object_card_id = $1 AND is_deleted = FALSE`,
          [subObject.id]
        );

        const itemsData = itemsResult.rows[0];
        const hasItems = parseInt(itemsData.items_count) > 0;

        return {
          ...subObject,
          items_count: parseInt(itemsData.items_count),
          // Use calculated values from children if items exist, otherwise use sub-object's own values
          cost: hasItems ? parseFloat(itemsData.total_cost) : subObject.cost,
          completion_percentage: hasItems ? parseInt(itemsData.avg_completion_percentage) : subObject.completion_percentage,
        };
      })
    );

    responseFormatter.success(res, subObjectsWithCalculations, 'Sub-object cards retrieved successfully');
  } catch (error) {
    console.error('Get sub-object cards by object card error:', error);
    responseFormatter.error(res, 'Error retrieving sub-object cards');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { object_card_id, name, deadline, cost, completion_percentage } = req.body;

    if (!object_card_id || !name) {
      responseFormatter.badRequest(res, 'Object card ID and name are required');
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

    // Validate completion_percentage range
    if (completion_percentage !== undefined && completion_percentage !== null) {
      const percentage = parseInt(completion_percentage);
      if (percentage < 0 || percentage > 100) {
        responseFormatter.badRequest(res, 'Completion percentage must be between 0 and 100');
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO sub_object_card (object_card_id, name, deadline, cost, completion_percentage)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        object_card_id,
        name,
        deadline || null,
        cost || null,
        completion_percentage !== undefined ? completion_percentage : 0,
      ]
    );

    responseFormatter.created(res, result.rows[0], 'Sub-object card created successfully');
  } catch (error) {
    console.error('Create sub-object card error:', error);
    responseFormatter.error(res, 'Error creating sub-object card');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { object_card_id, name, deadline, cost, completion_percentage } = req.body;

    if (!object_card_id || !name) {
      responseFormatter.badRequest(res, 'Object card ID and name are required');
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

    // Validate completion_percentage range
    if (completion_percentage !== undefined && completion_percentage !== null) {
      const percentage = parseInt(completion_percentage);
      if (percentage < 0 || percentage > 100) {
        responseFormatter.badRequest(res, 'Completion percentage must be between 0 and 100');
        return;
      }
    }

    const result = await pool.query(
      `UPDATE sub_object_card
       SET object_card_id = $1, name = $2, deadline = $3, cost = $4, completion_percentage = $5
       WHERE id = $6 AND is_deleted = FALSE
       RETURNING *`,
      [
        object_card_id,
        name,
        deadline || null,
        cost || null,
        completion_percentage !== undefined ? completion_percentage : 0,
        id,
      ]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Sub-object card updated successfully');
  } catch (error) {
    console.error('Update sub-object card error:', error);
    responseFormatter.error(res, 'Error updating sub-object card');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if sub-object has items
    const itemsCheck = await pool.query(
      'SELECT COUNT(*) FROM sub_object_card_item WHERE sub_object_card_id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (parseInt(itemsCheck.rows[0].count) > 0) {
      responseFormatter.badRequest(res, 'Cannot delete sub-object card with existing items');
      return;
    }

    const result = await pool.query(
      'UPDATE sub_object_card SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card not found');
      return;
    }

    responseFormatter.success(res, null, 'Sub-object card deleted successfully');
  } catch (error) {
    console.error('Delete sub-object card error:', error);
    responseFormatter.error(res, 'Error deleting sub-object card');
  }
};
