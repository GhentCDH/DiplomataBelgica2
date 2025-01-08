-- Data cleanup before normalization

update charter_actor
set role_nl = 'Beneficiaris'
where role_nl = 'Bénéficiaire';

update charter_type
set type_nl = 'charter'
where type_nl = 'charte';