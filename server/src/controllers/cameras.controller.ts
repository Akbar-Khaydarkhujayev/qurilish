import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { getCameraStatus } from '../services/camera-status.service';

export const getByObjectCardId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    const result = await pool.query(
      `SELECT id, object_card_id, name, camera_ip, camera_login, camera_type, created_at, updated_at
       FROM cameras
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY id ASC`,
      [objectCardId]
    );

    const cameras = result.rows.map((row: any) => ({
      ...row,
      status: getCameraStatus(row.id),
    }));

    responseFormatter.success(res, cameras, 'Cameras retrieved successfully');
  } catch (error) {
    console.error('Get cameras error:', error);
    responseFormatter.error(res, 'Error retrieving cameras');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;
    const { name, camera_ip, camera_login, camera_password, camera_type } = req.body;

    if (!camera_ip || !camera_login || !camera_password) {
      responseFormatter.badRequest(res, 'camera_ip, camera_login and camera_password are required');
      return;
    }

    const buildingCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );
    if (buildingCheck.rows.length === 0) {
      responseFormatter.notFound(res, 'Building not found');
      return;
    }

    const type = camera_type === 'hikvision' ? 'hikvision' : 'dahua';

    const result = await pool.query(
      `INSERT INTO cameras (object_card_id, name, camera_ip, camera_login, camera_password, camera_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, object_card_id, name, camera_ip, camera_login, camera_type, created_at`,
      [objectCardId, name || 'Camera', camera_ip, camera_login, camera_password, type]
    );

    responseFormatter.created(res, result.rows[0], 'Camera created successfully');
  } catch (error) {
    console.error('Create camera error:', error);
    responseFormatter.error(res, 'Error creating camera');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, camera_ip, camera_login, camera_password, camera_type } = req.body;

    if (!camera_ip || !camera_login) {
      responseFormatter.badRequest(res, 'camera_ip and camera_login are required');
      return;
    }

    const type = camera_type === 'hikvision' ? 'hikvision' : 'dahua';

    const updates: string[] = [
      'name = $1',
      'camera_ip = $2',
      'camera_login = $3',
      'camera_type = $4',
      'updated_at = CURRENT_TIMESTAMP',
    ];
    const params: any[] = [name || 'Camera', camera_ip, camera_login, type];

    if (camera_password) {
      updates.splice(4, 0, `camera_password = $${params.length + 1}`);
      params.push(camera_password);
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE cameras SET ${updates.join(', ')}
       WHERE id = $${params.length} AND is_deleted = FALSE
       RETURNING id, object_card_id, name, camera_ip, camera_login, camera_type, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Camera not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Camera updated successfully');
  } catch (error) {
    console.error('Update camera error:', error);
    responseFormatter.error(res, 'Error updating camera');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE cameras SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Camera not found');
      return;
    }

    responseFormatter.success(res, null, 'Camera deleted successfully');
  } catch (error) {
    console.error('Delete camera error:', error);
    responseFormatter.error(res, 'Error deleting camera');
  }
};
