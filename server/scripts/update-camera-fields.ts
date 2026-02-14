import pool from "../src/config/database";

async function main() {
  const result = await pool.query(
    "UPDATE object_card SET camera_login = 'admin', camera_password = 'parol12345', camera_ip = '192.168.77.22' WHERE is_deleted = FALSE",
  );
  console.log("Updated", result.rowCount, "buildings");
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
