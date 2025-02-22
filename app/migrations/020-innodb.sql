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