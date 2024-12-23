-- Data cleanup before normalization

update charter_actor
set role_nl = 'Beneficiaris'
where role_nl = 'Bénéficiaire';