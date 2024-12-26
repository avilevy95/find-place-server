// utils/versionHelper.js
import { Metadata } from '../models/database.js';

export const updateVersion = async (key) => {
  const newVersion = `v${Date.now()}`; // יצירת גרסה חדשה
  await Metadata.updateOne({ key }, { version: newVersion }, { upsert: true });
};
