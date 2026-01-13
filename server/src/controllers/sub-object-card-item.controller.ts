import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order } = req.query;

    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    const whereClause = 'WHERE sub_object_card_item.is_deleted = FALSE';
    const params: any[] = [];

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM sub_object_card_item ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        sub_object_card_item.*,
        sub_object_card.name as sub_object_name,
        construction_items.name as item_name,
        object_card.object_name,
        object_card.card_number
       FROM sub_object_card_item
       LEFT JOIN sub_object_card ON sub_object_card_item.sub_object_card_id = sub_object_card.id
       LEFT JOIN construction_items ON sub_object_card_item.construction_item_id = construction_items.id
       LEFT JOIN object_card ON sub_object_card.object_card_id = object_card.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Sub-object card items retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get sub-object card items error:', error);
    responseFormatter.error(res, 'Error retrieving sub-object card items');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        sub_object_card_item.*,
        sub_object_card.name as sub_object_name,
        sub_object_card.object_card_id,
        construction_items.name as item_name,
        object_card.object_name,
        object_card.card_number
       FROM sub_object_card_item
       LEFT JOIN sub_object_card ON sub_object_card_item.sub_object_card_id = sub_object_card.id
       LEFT JOIN construction_items ON sub_object_card_item.construction_item_id = construction_items.id
       LEFT JOIN object_card ON sub_object_card.object_card_id = object_card.id
       WHERE sub_object_card_item.id = $1 AND sub_object_card_item.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card item not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Sub-object card item retrieved successfully');
  } catch (error) {
    console.error('Get sub-object card item error:', error);
    responseFormatter.error(res, 'Error retrieving sub-object card item');
  }
};

export const getBySubObjectCardId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subObjectCardId } = req.params;

    // Verify sub-object card exists
    const subObjectCheck = await pool.query(
      'SELECT id FROM sub_object_card WHERE id = $1 AND is_deleted = FALSE',
      [subObjectCardId]
    );

    if (subObjectCheck.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card not found');
      return;
    }

    const result = await pool.query(
      `SELECT
        sub_object_card_item.*,
        construction_items.name as item_name
       FROM sub_object_card_item
       LEFT JOIN construction_items ON sub_object_card_item.construction_item_id = construction_items.id
       WHERE sub_object_card_item.sub_object_card_id = $1 AND sub_object_card_item.is_deleted = FALSE
       ORDER BY sub_object_card_item.deadline ASC NULLS LAST`,
      [subObjectCardId]
    );

    responseFormatter.success(res, result.rows, 'Sub-object card items retrieved successfully');
  } catch (error) {
    console.error('Get sub-object card items by sub-object card error:', error);
    responseFormatter.error(res, 'Error retrieving sub-object card items');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sub_object_card_id, construction_item_id, deadline, cost, completion_percentage } = req.body;

    if (!sub_object_card_id || !construction_item_id) {
      responseFormatter.badRequest(res, 'Sub-object card ID and construction item ID are required');
      return;
    }

    // Verify sub-object card exists
    const subObjectCheck = await pool.query(
      'SELECT id FROM sub_object_card WHERE id = $1 AND is_deleted = FALSE',
      [sub_object_card_id]
    );

    if (subObjectCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid sub-object card ID');
      return;
    }

    // Verify construction item exists
    const itemCheck = await pool.query(
      'SELECT id FROM construction_items WHERE id = $1 AND is_deleted = FALSE',
      [construction_item_id]
    );

    if (itemCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid construction item ID');
      return;
    }

    // Check for duplicate item in the same sub-object card
    const duplicateCheck = await pool.query(
      'SELECT id FROM sub_object_card_item WHERE sub_object_card_id = $1 AND construction_item_id = $2 AND is_deleted = FALSE',
      [sub_object_card_id, construction_item_id]
    );

    if (duplicateCheck.rows.length > 0) {
      responseFormatter.conflict(res, 'This construction item already exists in this sub-object card');
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
      `INSERT INTO sub_object_card_item (sub_object_card_id, construction_item_id, deadline, cost, completion_percentage)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        sub_object_card_id,
        construction_item_id,
        deadline || null,
        cost || null,
        completion_percentage !== undefined ? completion_percentage : 0,
      ]
    );

    responseFormatter.created(res, result.rows[0], 'Sub-object card item created successfully');
  } catch (error) {
    console.error('Create sub-object card item error:', error);
    responseFormatter.error(res, 'Error creating sub-object card item');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sub_object_card_id, construction_item_id, deadline, cost, completion_percentage } = req.body;

    if (!sub_object_card_id || !construction_item_id) {
      responseFormatter.badRequest(res, 'Sub-object card ID and construction item ID are required');
      return;
    }

    // Verify sub-object card exists
    const subObjectCheck = await pool.query(
      'SELECT id FROM sub_object_card WHERE id = $1 AND is_deleted = FALSE',
      [sub_object_card_id]
    );

    if (subObjectCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid sub-object card ID');
      return;
    }

    // Verify construction item exists
    const itemCheck = await pool.query(
      'SELECT id FROM construction_items WHERE id = $1 AND is_deleted = FALSE',
      [construction_item_id]
    );

    if (itemCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid construction item ID');
      return;
    }

    // Check for duplicate item (excluding current item)
    const duplicateCheck = await pool.query(
      'SELECT id FROM sub_object_card_item WHERE sub_object_card_id = $1 AND construction_item_id = $2 AND id != $3 AND is_deleted = FALSE',
      [sub_object_card_id, construction_item_id, id]
    );

    if (duplicateCheck.rows.length > 0) {
      responseFormatter.conflict(res, 'This construction item already exists in this sub-object card');
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
      `UPDATE sub_object_card_item
       SET sub_object_card_id = $1, construction_item_id = $2, deadline = $3, cost = $4, completion_percentage = $5
       WHERE id = $6 AND is_deleted = FALSE
       RETURNING *`,
      [
        sub_object_card_id,
        construction_item_id,
        deadline || null,
        cost || null,
        completion_percentage !== undefined ? completion_percentage : 0,
        id,
      ]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card item not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Sub-object card item updated successfully');
  } catch (error) {
    console.error('Update sub-object card item error:', error);
    responseFormatter.error(res, 'Error updating sub-object card item');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE sub_object_card_item SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Sub-object card item not found');
      return;
    }

    responseFormatter.success(res, null, 'Sub-object card item deleted successfully');
  } catch (error) {
    console.error('Delete sub-object card item error:', error);
    responseFormatter.error(res, 'Error deleting sub-object card item');
  }
};
