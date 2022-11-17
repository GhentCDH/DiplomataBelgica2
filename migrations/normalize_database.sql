-- Migrate all tables from MyISAM to InnoDB

ALTER TABLE actor ENGINE=InnoDB;
ALTER TABLE capacity ENGINE=InnoDB;
ALTER TABLE charter ENGINE=InnoDB;
ALTER TABLE charter_actor ENGINE=InnoDB;
ALTER TABLE charter_codex ENGINE=InnoDB;
ALTER TABLE charter_codex_url ENGINE=InnoDB;
ALTER TABLE charter_edition_indication ENGINE=InnoDB;
ALTER TABLE charter_language ENGINE=InnoDB;
ALTER TABLE charter_secondary_literature_indication ENGINE=InnoDB;
ALTER TABLE charter_type ENGINE=InnoDB;
ALTER TABLE charter_udt ENGINE=InnoDB;
ALTER TABLE codex ENGINE=InnoDB;
ALTER TABLE codex_external_image_url ENGINE=InnoDB;
ALTER TABLE codex_interested_institution ENGINE=InnoDB;
ALTER TABLE codex_material ENGINE=InnoDB;
ALTER TABLE codex_name_author ENGINE=InnoDB;
ALTER TABLE codex_url ENGINE=InnoDB;
ALTER TABLE copy ENGINE=InnoDB;
ALTER TABLE copy_external_image_url ENGINE=InnoDB;
ALTER TABLE copy_url ENGINE=InnoDB;
ALTER TABLE datation ENGINE=InnoDB;
ALTER TABLE edition ENGINE=InnoDB;
ALTER TABLE edition_indication ENGINE=InnoDB;
ALTER TABLE edition_indication_url ENGINE=InnoDB;
ALTER TABLE edition_url ENGINE=InnoDB;
ALTER TABLE flag ENGINE=InnoDB;
ALTER TABLE ikvti ENGINE=InnoDB;
ALTER TABLE image ENGINE=InnoDB;
ALTER TABLE localisation ENGINE=InnoDB;
ALTER TABLE log ENGINE=InnoDB;
ALTER TABLE name ENGINE=InnoDB;
ALTER TABLE original ENGINE=InnoDB;
ALTER TABLE original_external_image_url ENGINE=InnoDB;
ALTER TABLE original_url ENGINE=InnoDB;
ALTER TABLE person ENGINE=InnoDB;
ALTER TABLE place ENGINE=InnoDB;
ALTER TABLE repository ENGINE=InnoDB;
ALTER TABLE repository_url ENGINE=InnoDB;
ALTER TABLE secondary_literature ENGINE=InnoDB;
ALTER TABLE secondary_literature_indication ENGINE=InnoDB;
ALTER TABLE secondary_literature_indication_url ENGINE=InnoDB;
ALTER TABLE secondary_literature_url ENGINE=InnoDB;
ALTER TABLE standardizedname ENGINE=InnoDB;
ALTER TABLE time ENGINE=InnoDB;
ALTER TABLE variant ENGINE=InnoDB;
ALTER TABLE vidimus ENGINE=InnoDB;


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


-- Data cleanup

update charter_actor
set role_nl = 'Beneficiaris'
where role_nl = 'Bénéficiaire';



-- Normalize tables

CALL RenameTranslatedField("actor", "actor_place_institute", "place_institute");
CALL MigrateTranslatedField("actor", "order", "actor_order", "VARCHAR(255)");
CALL MigrateTranslatedField("actor", "place_institute", "actor_place_institute", "VARCHAR(255)");
ALTER TABLE `actor` RENAME COLUMN `actor_place_id` TO `place_id`;
ALTER TABLE `actor` RENAME COLUMN `actor_place_published` TO `place_published`;


RENAME TABLE `capacity` TO `actor_capacity`;
ALTER TABLE `actor_capacity` RENAME COLUMN `capacity_id` TO `actor_capacity_id`;
CALL RenameTranslatedField("actor_capacity", "capacity", "name");

RENAME TABLE `name` TO `actor_name`;
ALTER TABLE `actor_name` RENAME COLUMN `name_id` TO `actor_name_id`;
ALTER TABLE `actor_name` RENAME COLUMN `name_standardizedname_id` TO `actor_standardized_name_id`;
ALTER TABLE `actor_name` RENAME COLUMN `name_standardizedname_published` TO `actor_standardized_name_published`;

RENAME TABLE `variant` TO `actor_name_variant`;
ALTER TABLE `actor_name_variant` RENAME COLUMN `dummy_id` TO `actor_name_variant_id`;
ALTER TABLE `actor_name_variant` RENAME COLUMN `standardizedname_id` TO `actor_standardized_name_id`;

ALTER TABLE `standardizedname` RENAME TO `actor_standardized_name`;
ALTER TABLE `actor_standardized_name` RENAME COLUMN `standardizedname_id` TO `actor_standardized_name_id`;
ALTER TABLE `actor_standardized_name` RENAME COLUMN `standardizedname` TO `actor_standardized_name`;

ALTER TABLE `charter` RENAME COLUMN `dibe_id` TO `charter_id`;
ALTER TABLE `charter` RENAME COLUMN `charter_edition_indication_edition_id` TO `edition_id`;
ALTER TABLE `charter` RENAME COLUMN `cei_published` TO `charter_edition_indication_published`;
ALTER TABLE `charter` RENAME COLUMN `charter_place_id` TO `place_id`;
ALTER TABLE `charter` RENAME COLUMN `charter_place_found_name` TO `place_found_name`;
ALTER TABLE `charter` RENAME COLUMN `charter_place_published` TO `place_published`;
ALTER TABLE `charter` RENAME COLUMN `charter_edition_indication_id` TO `edition_indication_id`;
ALTER TABLE `charter` RENAME COLUMN `charter_edition_indication_published` TO `edition_indication_published`;
ALTER TABLE `charter` DROP COLUMN `charter_person_accountname`;
CALL MigrateTranslatedField("charter", "authenticity", "charter_authenticity", "VARCHAR(255)");
CALL MigrateTranslatedField("charter", "nature", "charter_nature", "VARCHAR(255)");

RENAME TABLE `charter_actor` TO `charter__actor`;
ALTER TABLE `charter__actor` RENAME COLUMN `ca_dibe_id` TO `charter_id`;
ALTER TABLE `charter__actor` RENAME COLUMN `ca_actor_id` TO `actor_id`;
ALTER TABLE `charter__actor` DROP PRIMARY KEY;
ALTER TABLE `charter__actor` DROP KEY `index_charter_actor_role_nl`;
ALTER TABLE `charter__actor` DROP KEY `index_charter_actor_role_fr`;
ALTER TABLE `charter__actor` DROP KEY `index_charter_actor_role_en`;
ALTER TABLE `charter__actor` DROP KEY `index_role_nl`;
ALTER TABLE `charter__actor` DROP KEY `index_role_fr`;
ALTER TABLE `charter__actor` DROP KEY `index_role_en`;
CALL MigrateTranslatedField("charter__actor", "role", "charter_actor_role", "VARCHAR(255)");
ALTER TABLE `charter__actor` ADD COLUMN `charter__actor_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;
ALTER TABLE `charter__actor` ADD UNIQUE KEY(`charter_id`, `actor_id`, `charter_actor_role_id`);

RENAME TABLE `charter_language` TO `charter__charter_language`;
ALTER TABLE `charter__charter_language` RENAME COLUMN `dummy_id` TO `charter__charter_language_id`;
ALTER TABLE `charter__charter_language` RENAME COLUMN `cl_dibe_id` TO `charter_id`;
CREATE INDEX `charter__charter_language_charter_id_idx` USING BTREE ON `charter__charter_language`(`charter_id`);
ALTER TABLE `charter__charter_language` ADD CONSTRAINT `charter__charter_language_id_fk` FOREIGN KEY(`charter_id`) REFERENCES `charter`(`charter_id`);
CALL MigrateTranslatedField("charter__charter_language", "language", "charter_language", "VARCHAR(255)");

ALTER TABLE `charter_type` RENAME COLUMN `ct_dibe_id` TO `charter_id`;
RENAME TABLE `charter_type` TO `charter__charter_type`;
ALTER TABLE `charter__charter_type` RENAME COLUMN `dummy_id` TO `charter__charter_type_id`;
CREATE INDEX `charter__charter_type_charter_id_idx` USING BTREE ON `charter__charter_type`(`charter_id`);
ALTER TABLE `charter__charter_type` ADD CONSTRAINT `charter__charter_type_id_fk` FOREIGN KEY(`charter_id`) REFERENCES `charter`(`charter_id`);
CALL MigrateTranslatedField("charter__charter_type", "type", "charter_type", "VARCHAR(255)");

RENAME TABLE `charter_codex` TO `charter__codex`;
ALTER TABLE `charter__codex` DROP PRIMARY KEY;
ALTER TABLE `charter__codex` RENAME COLUMN `cc_dibe_id` TO `charter_id`;
ALTER TABLE `charter__codex` RENAME COLUMN `cc_codex_id` TO `codex_id`;
ALTER TABLE `charter__codex` ADD COLUMN `charter__codex_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

RENAME TABLE `charter_codex_url` TO `charter__codex_url`;
ALTER TABLE `charter__codex_url` RENAME COLUMN `dummy_id` TO `charter__codex_url_id`;
ALTER TABLE `charter__codex_url` RENAME COLUMN `ccu_cc_dibe_id` TO `charter_id`;
ALTER TABLE `charter__codex_url` RENAME COLUMN `ccu_cc_codex_id` TO `codex_id`;

RENAME TABLE `charter_edition_indication` TO `charter__edition_indication`;
ALTER TABLE `charter__edition_indication` RENAME COLUMN `cei_dibe_id` TO `charter_id`;
ALTER TABLE `charter__edition_indication` RENAME COLUMN `cei_edition_indication_id` TO `edition_indication_id`;
ALTER TABLE `charter__edition_indication` RENAME COLUMN `cei_edition_indication_edition_id` TO `edition_id`;
ALTER TABLE `charter__edition_indication` DROP PRIMARY KEY;
ALTER TABLE `charter__edition_indication` ADD COLUMN `charter__edition_indication_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

RENAME TABLE `charter_secondary_literature_indication` TO `charter__secondary_literature_indication`;
ALTER TABLE `charter__secondary_literature_indication` RENAME COLUMN `csli_dibe_id` TO `charter_id`;
ALTER TABLE `charter__secondary_literature_indication` RENAME COLUMN `csli_secondary_literature_indication_id` TO `secondary_literature_indication_id`;
ALTER TABLE `charter__secondary_literature_indication` RENAME COLUMN `csli_secondary_literature_indication_secondary_literature_id` TO `secondary_literature_id`;
ALTER TABLE `charter__secondary_literature_indication` DROP PRIMARY KEY;
ALTER TABLE `charter__secondary_literature_indication` ADD COLUMN `charter__secondary_literature_indication_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

ALTER TABLE `charter_udt` RENAME COLUMN `cudt_dibe_id` TO `charter_id`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_type` TO `type`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_date_year` TO `year`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_date_month` TO `month`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_date_day` TO `day`;
ALTER TABLE `charter_udt` DROP PRIMARY KEY;
ALTER TABLE `charter_udt` ADD COLUMN `charter_udt_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

ALTER TABLE `codex` RENAME COLUMN `codex_repository_id` TO `repository_id`;
ALTER TABLE `codex` RENAME COLUMN `codex_repository_reference_number` TO `repository_reference_number`;
ALTER TABLE `codex` RENAME COLUMN `codex_repository_published` TO `repository_published`;

ALTER TABLE `codex_external_image_url` RENAME COLUMN `dummy_id` TO `codex_external_image_url_id`;
ALTER TABLE `codex_external_image_url` RENAME COLUMN `ceiu_codex_id` TO `codex_id`;

RENAME TABLE `codex_interested_institution` TO `codex__codex_institution`;
ALTER TABLE `codex__codex_institution` RENAME COLUMN `dummy_id` TO `codex__codex_institution_id`;
ALTER TABLE `codex__codex_institution` RENAME COLUMN `cii_codex_id` TO `codex_id`;
CALL MigrateTranslatedField("codex__codex_institution", "institution", "codex_institution", "VARCHAR(255)");

RENAME TABLE `codex_material` TO `codex__codex_material`;
ALTER TABLE `codex__codex_material` RENAME COLUMN `dummy_id` TO `codex__codex_material_id`;
ALTER TABLE `codex__codex_material` RENAME COLUMN `cm_codex_id` TO `codex_id`;
CALL MigrateTranslatedField("codex__codex_material", "material", "codex_material", "VARCHAR(255)");

ALTER TABLE `codex_name_author` RENAME COLUMN `dummy_id` TO `codex_name_author_id`;
ALTER TABLE `codex_name_author` RENAME COLUMN `cna_codex_id` TO `codex_id`;

ALTER TABLE `codex_url` RENAME COLUMN `dummy_id` TO `codex_url_id`;
ALTER TABLE `codex_url` RENAME COLUMN `cu_codex_id` TO `codex_id`;

ALTER TABLE `copy` RENAME COLUMN `copy_dibe_id` TO `charter_id`;
ALTER TABLE `copy` RENAME COLUMN `copy_charter_published` TO `charter_published`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_id` TO `codex_id`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_pof` TO `codex_pof`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_sequence_number` TO `codex_sequence_number`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_published` TO `codex_published`;
ALTER TABLE `copy` RENAME COLUMN `copy_repository_id` TO `repository_id`;
ALTER TABLE `copy` RENAME COLUMN `copy_repository_reference_number` TO `repository_reference_number`;
ALTER TABLE `copy` RENAME COLUMN `copy_repository_published` TO `repository_published`;

ALTER TABLE `copy_external_image_url` RENAME COLUMN `dummy_id` TO `copy_external_image_url_id`;
ALTER TABLE `copy_external_image_url` RENAME COLUMN `ceiu_copy_id` TO `copy_id`;

ALTER TABLE `copy_url` RENAME COLUMN `dummy_id` TO `copy_url_id`;
ALTER TABLE `copy_url` RENAME COLUMN `cu_copy_id` TO `copy_id`;

ALTER TABLE `datation` RENAME COLUMN `datation_dibe_id` TO `charter_id`;
ALTER TABLE `datation` RENAME COLUMN `datation_charter_published` TO `charter_published`;

RENAME TABLE `time` TO `datation_time`;
ALTER TABLE `datation_time` RENAME COLUMN `time_id` TO `datation_time_id`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_id` TO `datation_id`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_comments_nl` TO `datation_comments_nl`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_comments_fr` TO `datation_comments_fr`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_comments_en` TO `datation_comments_en`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_published` TO `datation_published`;
CALL RenameTranslatedField("datation_time", "time_datation_originality", "datation_time_originality");
CALL MigrateTranslatedField("datation_time", "datation_time_originality", "datation_time_originality", "VARCHAR(255)");

ALTER TABLE `edition_indication` RENAME COLUMN `edition_indication_edition_id` TO `edition_id`;
ALTER TABLE `edition_indication` RENAME COLUMN `eie_published` TO `edition_published`;

ALTER TABLE `edition_indication_url` RENAME COLUMN `dummy_id` TO `edition_indication_url_id`;
ALTER TABLE `edition_indication_url` RENAME COLUMN `eiu_edition_indication_id` TO `edition_indication_id`;
ALTER TABLE `edition_indication_url` RENAME COLUMN `eiu_edition_indication_edition_id` TO `edition_id`;

ALTER TABLE `edition_url` RENAME COLUMN `dummy_id` TO `edition_url_id`;
ALTER TABLE `edition_url` RENAME COLUMN `eu_edition_id` TO `edition_id`;

ALTER TABLE `image` RENAME COLUMN `image_original_id` TO `original_id`;
ALTER TABLE `image` RENAME COLUMN `image_original_sequence_number` TO `original_sequence_number`;
ALTER TABLE `image` RENAME COLUMN `image_original_published` TO `original_published`;
ALTER TABLE `image` RENAME COLUMN `image_copy_id` TO `copy_id`;
ALTER TABLE `image` RENAME COLUMN `image_copy_sequence_number` TO `copy_sequence_number`;
ALTER TABLE `image` RENAME COLUMN `image_copy_published` TO `copy_published`;
ALTER TABLE `image` RENAME COLUMN `image_codex_id` TO `codex_id`;
ALTER TABLE `image` RENAME COLUMN `image_codex_sequence_number` TO `codex_sequence_number`;
ALTER TABLE `image` RENAME COLUMN `image_codex_published` TO `codex_published`;

ALTER TABLE `original` RENAME COLUMN `original_dibe_id` TO `charter_id`;
ALTER TABLE `original` RENAME COLUMN `original_charter_published` TO `charter_published`;
ALTER TABLE `original` RENAME COLUMN `original_codex_id` TO `codex_id`;
ALTER TABLE `original` RENAME COLUMN `original_codex_published` TO `codex_published`;
ALTER TABLE `original` RENAME COLUMN `original_repository_id` TO `repository_id`;
ALTER TABLE `original` RENAME COLUMN `original_repository_reference_number` TO `repository_reference_number`;
ALTER TABLE `original` RENAME COLUMN `original_repository_published` TO `repository_published`;

ALTER TABLE `original_external_image_url` RENAME COLUMN `dummy_id` TO `original_external_image_url_id`;
ALTER TABLE `original_external_image_url` RENAME COLUMN `oeiu_original_id` TO `original_id`;

ALTER TABLE `original_url` RENAME COLUMN `dummy_id` TO `original_url_id`;
ALTER TABLE `original_url` RENAME COLUMN `ou_original_id` TO `original_id`;

RENAME TABLE `localisation` TO `place_localisation`;
ALTER TABLE `place_localisation` RENAME COLUMN `localisation_id` TO `place_localisation_id`;
CALL MigrateTranslatedField("place_localisation", "land", "country", "VARCHAR(255)");

ALTER TABLE `repository_url` RENAME COLUMN `dummy_id` TO `repository_url_id`;
ALTER TABLE `repository_url` RENAME COLUMN `ru_repository_id` TO `repository_id`;

ALTER TABLE `secondary_literature_indication` RENAME COLUMN `secondary_literature_indication_secondary_literature_id` TO `secondary_literature_id`;
ALTER TABLE `secondary_literature_indication` RENAME COLUMN `slisl_published` TO `secondary_literature_published`;

ALTER TABLE `secondary_literature_indication_url` RENAME COLUMN `dummy_id` TO `secondary_literature_indication_url_id`;
ALTER TABLE `secondary_literature_indication_url` RENAME COLUMN `sliu_secondary_literature_indication_id` TO `secondary_literature_indication_id`;
ALTER TABLE `secondary_literature_indication_url` RENAME COLUMN `sliu_secondary_literature_indication_secondary_literature_id` TO `secondary_literature_id`;

ALTER TABLE `secondary_literature_url` RENAME COLUMN `dummy_id` TO `secondary_literature_url_id`;
ALTER TABLE `secondary_literature_url` RENAME COLUMN `slu_secondary_literature_id` TO `secondary_literature_id`;

ALTER TABLE `vidimus` RENAME COLUMN `vidimus_dibe_id_1` TO `charter_id`;
ALTER TABLE `vidimus` RENAME COLUMN `vidimus_dibe_id_2` TO `related_charter_id`;
ALTER TABLE `vidimus` DROP PRIMARY KEY;
INSERT INTO vidimus(charter_id, related_charter_id, published) SELECT related_charter_id, charter_id, published FROM vidimus;
ALTER TABLE `vidimus` ADD COLUMN `vidimus_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

CALL MigrateTranslatedField("place", "diocese_name", "diocese", "VARCHAR(255)");
CALL MigrateTranslatedField("place", "principality_name", "principality", "VARCHAR(255)");

DROP TABLE `person`;
