# codex

ALTER TABLE db_dibe.codex ADD CONSTRAINT codex_FK FOREIGN KEY (repository_id) REFERENCES db_dibe.repository(repository_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE db_dibe.codex_name_author ADD CONSTRAINT codex_name__author_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.codex_external_image_url ADD CONSTRAINT codex_external_image_url__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.codex_url ADD CONSTRAINT codex_url__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE db_dibe.codex__codex_institution ADD CONSTRAINT codex__codex_institution__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.codex__codex_material ADD CONSTRAINT codex__codex_material__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;

# copy

ALTER TABLE db_dibe.copy ADD CONSTRAINT copy__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.copy ADD CONSTRAINT copy__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.copy ADD CONSTRAINT copy__repository_id_fk FOREIGN KEY (repository_id) REFERENCES db_dibe.repository(repository_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE db_dibe.copy_external_image_url ADD CONSTRAINT copy_external_image_url__copy_id_fk FOREIGN KEY (copy_id) REFERENCES db_dibe.copy(copy_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE db_dibe.copy_url ADD CONSTRAINT copy_url__copy_id_fk FOREIGN KEY (copy_id) REFERENCES db_dibe.copy(copy_id) ON DELETE CASCADE ON UPDATE CASCADE;

# original

delete from original_url where original_id not in ( select original_id from original )

ALTER TABLE db_dibe.original_external_image_url ADD CONSTRAINT original_external_image_url__original_id_fk FOREIGN KEY (original_id) REFERENCES db_dibe.original(original_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.original_url ADD CONSTRAINT origina_url__original_id_fk FOREIGN KEY (original_id) REFERENCES db_dibe.original(original_id) ON DELETE CASCADE ON UPDATE CASCADE;

update original set charter_id = null where charter_id not in ( select charter_id from charter )

ALTER TABLE db_dibe.original ADD CONSTRAINT original__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.original ADD CONSTRAINT original__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.original ADD CONSTRAINT original__repository_id_fk FOREIGN KEY (repository_id) REFERENCES db_dibe.repository(repository_id) ON DELETE CASCADE ON UPDATE CASCADE;

# charter__codex

ALTER TABLE db_dibe.charter__codex ADD CONSTRAINT charter__codex__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.charter__codex ADD CONSTRAINT charter__codex__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;

# charter__codex_url

ALTER TABLE db_dibe.charter__codex_url ADD CONSTRAINT charter__codex_url__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.charter__codex_url ADD CONSTRAINT charter__codex_url__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;

# edition_url

delete from edition_url where edition_id not in ( select edition_id from edition )

ALTER TABLE db_dibe.edition_url ADD CONSTRAINT edition_url__edition_id_fk FOREIGN KEY (edition_id) REFERENCES db_dibe.edition(edition_id) ON DELETE CASCADE ON UPDATE CASCADE;

# repository_url

ALTER TABLE db_dibe.repository_url ADD CONSTRAINT repository_url__repository_id_fk FOREIGN KEY (repository_id) REFERENCES db_dibe.repository(repository_id) ON DELETE CASCADE ON UPDATE CASCADE;

# vidimus
# select * from vidimus where charter_id not in ( select charter_id from charter )

delete from vidimus where charter_id not in ( select charter_id from charter );
delete from vidimus where related_charter_id not in ( select charter_id from charter );

ALTER TABLE db_dibe.vidimus ADD CONSTRAINT vidimus__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.vidimus ADD CONSTRAINT vidimus__related_charter_id_fk FOREIGN KEY (related_charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;

# actor

ALTER TABLE db_dibe.actor MODIFY COLUMN place_id bigint(20) unsigned NULL;

## actor_capacity_id 80 missing
insert into actor_capacity set actor_capacity.actor_capacity_id = 80, actor_capacity.name_nl = "onbekend", actor_capacity.name_en = "unknown", actor_capacity.name_fr = "inconnu", published = 1;

## some actors have missing names
delete from actor where actor_name_id not in ( select actor_name_id from actor_name );

## some actors have missing places
update actor set place_id = null where place_id is not null and place_id not in ( select place_id from place );

ALTER TABLE db_dibe.actor ADD CONSTRAINT actor__actor_capacity_id_fk FOREIGN KEY (actor_capacity_id) REFERENCES db_dibe.actor_capacity(actor_capacity_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE db_dibe.actor ADD CONSTRAINT actor__actor_name_id_fk FOREIGN KEY (actor_name_id) REFERENCES db_dibe.actor_name(actor_name_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE db_dibe.actor ADD CONSTRAINT actor__place_id_fk FOREIGN KEY (place_id) REFERENCES db_dibe.place(place_id) ON DELETE CASCADE ON UPDATE CASCADE;

# actor_name

## probleem: heel veel namen verwijzen naar onbestaande standardized names
## see: select * from actor_name where actor_standardized_name_id is not null and actor_standardized_name_id not in ( select actor_standardized_name_id from actor_standardized_name  )
    ## fix: allow actor_standardized_name_id null and fix incorrect values

ALTER TABLE db_dibe.actor_name MODIFY COLUMN actor_standardized_name_id bigint(20) unsigned NULL;
update actor_name set actor_standardized_name_id = null where actor_standardized_name_id is not null and actor_standardized_name_id not in ( select actor_standardized_name_id from actor_standardized_name  );

ALTER TABLE db_dibe.actor_name ADD CONSTRAINT actor_name__actor_standardized_name_id_fk FOREIGN KEY (actor_standardized_name_id) REFERENCES db_dibe.actor_standardized_name(actor_standardized_name_id) ON DELETE CASCADE ON UPDATE CASCADE;

## actor_name_variant

ALTER TABLE db_dibe.actor_name_variant ADD CONSTRAINT actor_name_variant__actor_standardized_name_id_fk FOREIGN KEY (actor_standardized_name_id) REFERENCES db_dibe.actor_standardized_name(actor_standardized_name_id) ON DELETE CASCADE ON UPDATE CASCADE;

# select * from actor_name where actor_standardized_name_id is not null and actor_standardized_name_id not in ( select actor_standardized_name_id from actor_standardized_name  )




    # charter_udt

delete from charter_udt where charter_id not in ( select charter_id from charter );

ALTER TABLE db_dibe.charter_udt ADD CONSTRAINT charter_udt__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;

# datation

ALTER TABLE db_dibe.datation ADD CONSTRAINT datation_time__datation_id_fk FOREIGN KEY (datation_id) REFERENCES db_dibe.datation(datation_id) ON DELETE CASCADE ON UPDATE CASCADE;

# datation_time

delete from datation_time where datation_id is not null and datation_id not in ( select datation_id from datation )

ALTER TABLE datation_time ADD CONSTRAINT datation_time__datation_id_fk FOREIGN KEY (datation_id) REFERENCES db_dibe.datation(datation_id) ON DELETE CASCADE ON UPDATE CASCADE;


# image

delete from image where original_id is not null and original_id not in ( select original_id from original )


ALTER TABLE db_dibe.image ADD CONSTRAINT image__original_id_fk FOREIGN KEY (original_id) REFERENCES db_dibe.original(original_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.image ADD CONSTRAINT image__codex_id_fk FOREIGN KEY (codex_id) REFERENCES db_dibe.codex(codex_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.image ADD CONSTRAINT image__copy_id_fk FOREIGN KEY (copy_id) REFERENCES db_dibe.copy(copy_id) ON DELETE CASCADE ON UPDATE CASCADE;

# charter__actor

delete from charter__actor where charter_id not in ( select charter_id from charter );
delete from charter__actor where actor_id not in ( select actor_id from actor );

ALTER TABLE db_dibe.charter__actor DROP FOREIGN KEY charter__actor__charter_actor_role_id_fk;
ALTER TABLE db_dibe.charter__actor ADD CONSTRAINT charter__actor__actor_id_fk FOREIGN KEY (actor_id) REFERENCES db_dibe.actor(actor_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE db_dibe.charter__actor ADD CONSTRAINT charter__actor__charter_id_fk FOREIGN KEY (charter_id) REFERENCES db_dibe.charter(charter_id) ON DELETE CASCADE ON UPDATE CASCADE;

# place

ALTER TABLE place ADD CONSTRAINT place__place_localisation_id_fk FOREIGN KEY (place_localisation_id) REFERENCES place_localisation(place_localisation_id) ON DELETE CASCADE ON UPDATE CASCADE;

