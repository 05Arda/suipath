import { Pool } from "@neondatabase/serverless";

// Bağlantı havuzu oluşturuyoruz
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log(
  "Database pool created." +
    (process.env.DATABASE_URL ? " URL found." : " No URL!")
);

export default pool;
