exports.up = function(knex) {
  return knex.schema.createTable("users", usersTable => {
    usersTable
      .string("username")
      .primary()
      .unique()
      .notNullable();
    usersTable.string("avatar_url");
    usersTable.string("name").notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable("users");
};
