-- Stored procedure to rename a translated field,
-- for example `actor_place_institute_nl`, `actor_place_institute_fr` and `actor_place_institute_en`
-- to `place_institute_nl`, `place_institute_fr` and `place_institute_en`

DROP PROCEDURE IF EXISTS RenameTranslatedField;

DELIMITER //
CREATE PROCEDURE RenameTranslatedField(
    IN table_name VARCHAR(255),
    IN old_field_name VARCHAR(255),
    IN new_field_name VARCHAR(255)
)
BEGIN
	SET @stmt = CONCAT("ALTER TABLE ", table_name, " RENAME COLUMN ", old_field_name, "_nl TO ", new_field_name, "_nl");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("ALTER TABLE ", table_name, " RENAME COLUMN ", old_field_name, "_fr TO ", new_field_name, "_fr");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("ALTER TABLE ", table_name, " RENAME COLUMN ", old_field_name, "_en TO ", new_field_name, "_en");
PREPARE stmt FROM @stmt;
EXECUTE stmt;
END //
DELIMITER ;


-- Stored procedure to migrate a translated field into a separate table,
-- for example `order_nl`, `order_fr` and `order_en` from the `actor` table into `actor_order`,
-- referenced by `actor_order_id`

DROP PROCEDURE IF EXISTS MigrateTranslatedField;

DELIMITER //
CREATE PROCEDURE MigrateTranslatedField(
    IN table_name VARCHAR(255),
    IN field_name VARCHAR(255),
    IN result_table_name VARCHAR(255),
    IN result_field_type VARCHAR(255)
)
BEGIN
   	DECLARE CONTINUE HANDLER FOR SQLSTATE '42000' BEGIN END;
	SET @full_name_id = CONCAT(result_table_name, "_id");

	-- drop new_table
	SET @stmt = CONCAT("DROP TABLE IF EXISTS ", result_table_name);
PREPARE stmt FROM @stmt;
EXECUTE stmt;

-- drop full_name_id column

SET @stmt = CONCAT("ALTER TABLE ", table_name, " DROP FOREIGN KEY ", table_name, "__", @full_name_id, "_fk");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("ALTER TABLE ", table_name, " DROP INDEX ", table_name, "__", @full_name_id, "_idx");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("ALTER TABLE ", table_name, " DROP COLUMN ", @full_name_id);
PREPARE stmt FROM @stmt;
EXECUTE stmt;

-- add full_name_id column
SET @stmt = CONCAT("ALTER TABLE ", table_name, " ADD ", @full_name_id, " INT UNSIGNED NULL");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

-- create new table
SET @stmt = CONCAT("CREATE TABLE ", result_table_name, " (",
                       "`", @full_name_id, "` INT UNSIGNED NOT NULL AUTO_INCREMENT, ",
                       "`name_nl` ", result_field_type, " NULL, ",
                       "`name_fr` ", result_field_type, " NULL, ",
                       "`name_en` ", result_field_type, " NULL, ",
                       "PRIMARY KEY(`", @full_name_id, "`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
PREPARE stmt FROM @stmt;
EXECUTE stmt;


SET @stmt = CONCAT("CREATE INDEX `", table_name, "__", @full_name_id, "_idx` USING BTREE ",
		"ON ", table_name, "(", @full_name_id, ")");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("ALTER TABLE ", table_name, " ADD CONSTRAINT ",
		"`", table_name, "__", @full_name_id, "_fk` FOREIGN KEY (`",
		@full_name_id, "`) REFERENCES `", result_table_name, "`(`", @full_name_id, "`)");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("UPDATE ", table_name, " SET ",
		field_name, "_nl = NULLIF(TRIM(", field_name, "_nl), ''), ",
		field_name, "_en = NULLIF(TRIM(", field_name, "_en), ''), ",
		field_name, "_fr = NULLIF(TRIM(", field_name, "_fr), '')");

	SET @stmt = CONCAT("INSERT INTO ", result_table_name, "(name_nl, name_fr, name_en) ",
		"SELECT DISTINCT ", field_name, "_nl, ", field_name, "_fr, ", field_name, "_en FROM ", table_name,
		" WHERE NOT (", field_name, "_nl IS NULL AND ", field_name, "_fr IS NULL AND ", field_name, "_en IS NULL)");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

SET @stmt = CONCAT("UPDATE ", table_name, " AS t1, ", result_table_name, " AS t2 ",
		"SET t1.", @full_name_id, " = t2.", @full_name_id, " WHERE t1.", field_name, "_nl <=> t2.name_nl ",
		"AND t1.", field_name, "_fr <=> t2.name_fr AND t1.", field_name, "_en <=> t2.name_en");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

-- foreign keys can be null!
-- SET @stmt = CONCAT("ALTER TABLE ", table_name, " MODIFY COLUMN ", @full_name_id, " INT UNSIGNED NOT NULL");
-- PREPARE stmt FROM @stmt;
-- EXECUTE stmt;

SET @stmt = CONCAT("ALTER TABLE ", table_name, " DROP COLUMN ", field_name, "_nl, ",
		"DROP COLUMN ", field_name, "_fr, DROP COLUMN ", field_name, "_en");
PREPARE stmt FROM @stmt;
EXECUTE stmt;

END //
DELIMITER ;