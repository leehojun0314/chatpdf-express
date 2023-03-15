const configs = require('../../configs');
const sql = require('mssql');
const sqlConnectionPool = new sql.ConnectionPool({
	...configs.db,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000,
	},
});
async function getSql() {
	return await sqlConnectionPool.connect();
}
module.exports = getSql;
