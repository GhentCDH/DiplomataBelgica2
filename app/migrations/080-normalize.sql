-- actor

CALL RenameTranslatedField("actor", "actor_place_institute", "place_institute");
CALL MigrateTranslatedField("actor", "order", "actor_order", "VARCHAR(255)");
CALL MigrateTranslatedField("actor", "place_institute", "actor_place_institute", "VARCHAR(255)");
ALTER TABLE `actor` RENAME COLUMN `actor_place_id` TO `place_id`;
ALTER TABLE `actor` RENAME COLUMN `actor_place_published` TO `place_published`;

-- capacity -> actor_capacity

RENAME TABLE `capacity` TO `actor_capacity`;
ALTER TABLE `actor_capacity` RENAME COLUMN `capacity_id` TO `actor_capacity_id`;
CALL RenameTranslatedField("actor_capacity", "capacity", "name");

-- name -> actor_name

RENAME TABLE `name` TO `actor_name`;
ALTER TABLE `actor_name` RENAME COLUMN `name_id` TO `actor_name_id`;
ALTER TABLE `actor_name` RENAME COLUMN `name_standardizedname_id` TO `actor_standardized_name_id`;
ALTER TABLE `actor_name` RENAME COLUMN `name_standardizedname_published` TO `actor_standardized_name_published`;
ALTER TABLE `actor_name` RENAME COLUMN `full_name_nl` TO `name_nl`;
ALTER TABLE `actor_name` RENAME COLUMN `full_name_en` TO `name_en`;
ALTER TABLE `actor_name` RENAME COLUMN `full_name_fr` TO `name_fr`;

-- name_variant -> actor_name_variant

RENAME TABLE `variant` TO `actor_name_variant`;
ALTER TABLE `actor_name_variant` RENAME COLUMN `dummy_id` TO `actor_name_variant_id`;
ALTER TABLE `actor_name_variant` RENAME COLUMN `standardizedname_id` TO `actor_standardized_name_id`;
ALTER TABLE `actor_name_variant` RENAME COLUMN `variant` TO `name`;

-- standardizedname -> actor_standardized_name

ALTER TABLE `standardizedname` RENAME TO `actor_standardized_name`;
ALTER TABLE `actor_standardized_name` RENAME COLUMN `standardizedname_id` TO `actor_standardized_name_id`;
ALTER TABLE `actor_standardized_name` RENAME COLUMN `standardizedname` TO `actor_standardized_name`;

-- charter

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

-- charter_actor -> charter__actor

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

-- charter_language -> charter__charter_language

RENAME TABLE `charter_language` TO `charter__charter_language`;
ALTER TABLE `charter__charter_language` RENAME COLUMN `dummy_id` TO `charter__charter_language_id`;
ALTER TABLE `charter__charter_language` RENAME COLUMN `cl_dibe_id` TO `charter_id`;
CREATE INDEX `charter__charter_language_charter_id_idx` USING BTREE ON `charter__charter_language`(`charter_id`);
ALTER TABLE `charter__charter_language` ADD CONSTRAINT `charter__charter_language_id_fk` FOREIGN KEY(`charter_id`) REFERENCES `charter`(`charter_id`);
CALL MigrateTranslatedField("charter__charter_language", "language", "charter_language", "VARCHAR(255)");

-- charter_type -> charter__charter_type

ALTER TABLE `charter_type` RENAME COLUMN `ct_dibe_id` TO `charter_id`;
RENAME TABLE `charter_type` TO `charter__charter_type`;
ALTER TABLE `charter__charter_type` RENAME COLUMN `dummy_id` TO `charter__charter_type_id`;
CREATE INDEX `charter__charter_type_charter_id_idx` USING BTREE ON `charter__charter_type`(`charter_id`);
ALTER TABLE `charter__charter_type` ADD CONSTRAINT `charter__charter_type_id_fk` FOREIGN KEY(`charter_id`) REFERENCES `charter`(`charter_id`);
CALL MigrateTranslatedField("charter__charter_type", "type", "charter_type", "VARCHAR(255)");

-- charter_codex -> charter__codex

RENAME TABLE `charter_codex` TO `charter__codex`;
ALTER TABLE `charter__codex` DROP PRIMARY KEY;
ALTER TABLE `charter__codex` RENAME COLUMN `cc_dibe_id` TO `charter_id`;
ALTER TABLE `charter__codex` RENAME COLUMN `cc_codex_id` TO `codex_id`;
ALTER TABLE `charter__codex` ADD COLUMN `charter__codex_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

-- charter_codex_url -> charter__codex_url

RENAME TABLE `charter_codex_url` TO `charter__codex_url`;
ALTER TABLE `charter__codex_url` RENAME COLUMN `dummy_id` TO `charter__codex_url_id`;
ALTER TABLE `charter__codex_url` RENAME COLUMN `ccu_cc_dibe_id` TO `charter_id`;
ALTER TABLE `charter__codex_url` RENAME COLUMN `ccu_cc_codex_id` TO `codex_id`;

-- charter_edition_indication -> charter__edition_indication

RENAME TABLE `charter_edition_indication` TO `charter__edition_indication`;
ALTER TABLE `charter__edition_indication` RENAME COLUMN `cei_dibe_id` TO `charter_id`;
ALTER TABLE `charter__edition_indication` RENAME COLUMN `cei_edition_indication_id` TO `edition_indication_id`;
ALTER TABLE `charter__edition_indication` RENAME COLUMN `cei_edition_indication_edition_id` TO `edition_id`;
ALTER TABLE `charter__edition_indication` DROP PRIMARY KEY;
ALTER TABLE `charter__edition_indication` ADD COLUMN `charter__edition_indication_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

-- charter_secondary_literature_indication -> charter__secondary_literature_indication

RENAME TABLE `charter_secondary_literature_indication` TO `charter__secondary_literature_indication`;
ALTER TABLE `charter__secondary_literature_indication` RENAME COLUMN `csli_dibe_id` TO `charter_id`;
ALTER TABLE `charter__secondary_literature_indication` RENAME COLUMN `csli_secondary_literature_indication_id` TO `secondary_literature_indication_id`;
ALTER TABLE `charter__secondary_literature_indication` RENAME COLUMN `csli_secondary_literature_indication_secondary_literature_id` TO `secondary_literature_id`;
ALTER TABLE `charter__secondary_literature_indication` DROP PRIMARY KEY;
ALTER TABLE `charter__secondary_literature_indication` ADD COLUMN `charter__secondary_literature_indication_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

-- charter_udt

ALTER TABLE `charter_udt` RENAME COLUMN `cudt_dibe_id` TO `charter_id`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_type` TO `type`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_date_year` TO `year`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_date_month` TO `month`;
ALTER TABLE `charter_udt` RENAME COLUMN `udt_date_day` TO `day`;
ALTER TABLE `charter_udt` DROP PRIMARY KEY;
ALTER TABLE `charter_udt` ADD COLUMN `charter_udt_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

-- codex

ALTER TABLE `codex` RENAME COLUMN `codex_repository_id` TO `repository_id`;
ALTER TABLE `codex` RENAME COLUMN `codex_repository_reference_number` TO `repository_reference_number`;
ALTER TABLE `codex` RENAME COLUMN `codex_repository_published` TO `repository_published`;

-- codex_external_image_url

ALTER TABLE `codex_external_image_url` RENAME COLUMN `dummy_id` TO `codex_external_image_url_id`;
ALTER TABLE `codex_external_image_url` RENAME COLUMN `ceiu_codex_id` TO `codex_id`;

-- codex_interested_institution -> codex__codex_institution

RENAME TABLE `codex_interested_institution` TO `codex__codex_institution`;
ALTER TABLE `codex__codex_institution` RENAME COLUMN `dummy_id` TO `codex__codex_institution_id`;
ALTER TABLE `codex__codex_institution` RENAME COLUMN `cii_codex_id` TO `codex_id`;
CALL MigrateTranslatedField("codex__codex_institution", "institution", "codex_institution", "VARCHAR(255)");

-- codex_material -> codex__codex_material

RENAME TABLE `codex_material` TO `codex__codex_material`;
ALTER TABLE `codex__codex_material` RENAME COLUMN `dummy_id` TO `codex__codex_material_id`;
ALTER TABLE `codex__codex_material` RENAME COLUMN `cm_codex_id` TO `codex_id`;
CALL MigrateTranslatedField("codex__codex_material", "material", "codex_material", "VARCHAR(255)");

-- codex_name_author

ALTER TABLE `codex_name_author` RENAME COLUMN `dummy_id` TO `codex_name_author_id`;
ALTER TABLE `codex_name_author` RENAME COLUMN `cna_codex_id` TO `codex_id`;

-- codex_url

ALTER TABLE `codex_url` RENAME COLUMN `dummy_id` TO `codex_url_id`;
ALTER TABLE `codex_url` RENAME COLUMN `cu_codex_id` TO `codex_id`;

-- copy

ALTER TABLE `copy` RENAME COLUMN `copy_dibe_id` TO `charter_id`;
ALTER TABLE `copy` RENAME COLUMN `copy_charter_published` TO `charter_published`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_id` TO `codex_id`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_pof` TO `codex_pof`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_sequence_number` TO `codex_sequence_number`;
ALTER TABLE `copy` RENAME COLUMN `copy_codex_published` TO `codex_published`;
ALTER TABLE `copy` RENAME COLUMN `copy_repository_id` TO `repository_id`;
ALTER TABLE `copy` RENAME COLUMN `copy_repository_reference_number` TO `repository_reference_number`;
ALTER TABLE `copy` RENAME COLUMN `copy_repository_published` TO `repository_published`;

-- copy_external_image_url

ALTER TABLE `copy_external_image_url` RENAME COLUMN `dummy_id` TO `copy_external_image_url_id`;
ALTER TABLE `copy_external_image_url` RENAME COLUMN `ceiu_copy_id` TO `copy_id`;

-- copy_url

ALTER TABLE `copy_url` RENAME COLUMN `dummy_id` TO `copy_url_id`;
ALTER TABLE `copy_url` RENAME COLUMN `cu_copy_id` TO `copy_id`;

-- datation

ALTER TABLE `datation` RENAME COLUMN `datation_dibe_id` TO `charter_id`;
ALTER TABLE `datation` RENAME COLUMN `datation_charter_published` TO `charter_published`;

-- time -> datation_time

RENAME TABLE `time` TO `datation_time`;
ALTER TABLE `datation_time` RENAME COLUMN `time_id` TO `datation_time_id`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_id` TO `datation_id`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_comments_nl` TO `datation_comments_nl`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_comments_fr` TO `datation_comments_fr`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_comments_en` TO `datation_comments_en`;
ALTER TABLE `datation_time` RENAME COLUMN `time_datation_published` TO `datation_published`;
CALL RenameTranslatedField("datation_time", "time_datation_originality", "datation_time_originality");
CALL MigrateTranslatedField("datation_time", "datation_time_originality", "datation_time_originality", "VARCHAR(255)");

-- edition_indication

ALTER TABLE `edition_indication` RENAME COLUMN `edition_indication_edition_id` TO `edition_id`;
ALTER TABLE `edition_indication` RENAME COLUMN `eie_published` TO `edition_published`;

-- edition_indication_url

ALTER TABLE `edition_indication_url` RENAME COLUMN `dummy_id` TO `edition_indication_url_id`;
ALTER TABLE `edition_indication_url` RENAME COLUMN `eiu_edition_indication_id` TO `edition_indication_id`;
ALTER TABLE `edition_indication_url` RENAME COLUMN `eiu_edition_indication_edition_id` TO `edition_id`;

-- edition_url

ALTER TABLE `edition_url` RENAME COLUMN `dummy_id` TO `edition_url_id`;
ALTER TABLE `edition_url` RENAME COLUMN `eu_edition_id` TO `edition_id`;

-- image

ALTER TABLE `image` RENAME COLUMN `image_original_id` TO `original_id`;
ALTER TABLE `image` RENAME COLUMN `image_original_sequence_number` TO `original_sequence_number`;
ALTER TABLE `image` RENAME COLUMN `image_original_published` TO `original_published`;
ALTER TABLE `image` RENAME COLUMN `image_copy_id` TO `copy_id`;
ALTER TABLE `image` RENAME COLUMN `image_copy_sequence_number` TO `copy_sequence_number`;
ALTER TABLE `image` RENAME COLUMN `image_copy_published` TO `copy_published`;
ALTER TABLE `image` RENAME COLUMN `image_codex_id` TO `codex_id`;
ALTER TABLE `image` RENAME COLUMN `image_codex_sequence_number` TO `codex_sequence_number`;
ALTER TABLE `image` RENAME COLUMN `image_codex_published` TO `codex_published`;

-- original

ALTER TABLE `original` RENAME COLUMN `original_dibe_id` TO `charter_id`;
ALTER TABLE `original` RENAME COLUMN `original_charter_published` TO `charter_published`;
ALTER TABLE `original` RENAME COLUMN `original_codex_id` TO `codex_id`;
ALTER TABLE `original` RENAME COLUMN `original_codex_published` TO `codex_published`;
ALTER TABLE `original` RENAME COLUMN `original_repository_id` TO `repository_id`;
ALTER TABLE `original` RENAME COLUMN `original_repository_reference_number` TO `repository_reference_number`;
ALTER TABLE `original` RENAME COLUMN `original_repository_published` TO `repository_published`;

-- original_external_image_url

ALTER TABLE `original_external_image_url` RENAME COLUMN `dummy_id` TO `original_external_image_url_id`;
ALTER TABLE `original_external_image_url` RENAME COLUMN `oeiu_original_id` TO `original_id`;

-- original_url

ALTER TABLE `original_url` RENAME COLUMN `dummy_id` TO `original_url_id`;
ALTER TABLE `original_url` RENAME COLUMN `ou_original_id` TO `original_id`;

-- localisation -> place_localisation

RENAME TABLE `localisation` TO `place_localisation`;
ALTER TABLE `place_localisation` RENAME COLUMN `localisation_id` TO `place_localisation_id`;
CALL MigrateTranslatedField("place_localisation", "land", "country", "VARCHAR(255)");

-- repository_url

ALTER TABLE `repository_url` RENAME COLUMN `dummy_id` TO `repository_url_id`;
ALTER TABLE `repository_url` RENAME COLUMN `ru_repository_id` TO `repository_id`;

-- secondary_literature_indication

ALTER TABLE `secondary_literature_indication` RENAME COLUMN `secondary_literature_indication_secondary_literature_id` TO `secondary_literature_id`;
ALTER TABLE `secondary_literature_indication` RENAME COLUMN `slisl_published` TO `secondary_literature_published`;

-- secondary_literature_indication_url

ALTER TABLE `secondary_literature_indication_url` RENAME COLUMN `dummy_id` TO `secondary_literature_indication_url_id`;
ALTER TABLE `secondary_literature_indication_url` RENAME COLUMN `sliu_secondary_literature_indication_id` TO `secondary_literature_indication_id`;
ALTER TABLE `secondary_literature_indication_url` RENAME COLUMN `sliu_secondary_literature_indication_secondary_literature_id` TO `secondary_literature_id`;

-- secondary_literature_url

ALTER TABLE `secondary_literature_url` RENAME COLUMN `dummy_id` TO `secondary_literature_url_id`;
ALTER TABLE `secondary_literature_url` RENAME COLUMN `slu_secondary_literature_id` TO `secondary_literature_id`;

-- vidimus

ALTER TABLE `vidimus` RENAME COLUMN `vidimus_dibe_id_1` TO `charter_id`;
ALTER TABLE `vidimus` RENAME COLUMN `vidimus_dibe_id_2` TO `related_charter_id`;
ALTER TABLE `vidimus` DROP PRIMARY KEY;
INSERT INTO vidimus(charter_id, related_charter_id, published) SELECT related_charter_id, charter_id, published FROM vidimus;
ALTER TABLE `vidimus` ADD COLUMN `vidimus_id` INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT FIRST;

-- place

CALL MigrateTranslatedField("place", "diocese_name", "diocese", "VARCHAR(255)");
CALL MigrateTranslatedField("place", "principality_name", "principality", "VARCHAR(255)");

-- person

DROP TABLE `person`;
