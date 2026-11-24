<?php
namespace App\Tests\Model;

use App\Model\AbstractModel;
use App\Model\CharterActorRole;
use App\Model\Place;
use PHPUnit\Framework\TestCase;

class TraitLocalizedAttributesTest extends TestCase
{
    protected function tearDown(): void
    {
        AbstractModel::setLocale('en');
    }

    private function role(array $attributes): CharterActorRole
    {
        $role = new CharterActorRole();
        $role->setRawAttributes([$role->getKeyName() => 1] + $attributes);

        return $role;
    }

    public function testNoPhantomLocalizedAccessor(): void
    {
        $place = new Place();

        $this->assertSame([], $place->getMutatedAttributes());
        $this->assertFalse($place->hasGetMutator('localized'));
    }

    public function testRealLocalizedColumnIsSerialized(): void
    {
        $place = new Place();
        $place->setRawAttributes([$place->getKeyName() => 1, 'localized' => 'x']);

        $this->assertSame('x', $place->toArray()['localized']);
    }

    public function testFallbackOrder(): void
    {
        $role = $this->role(['name_nl' => null, 'name_en' => '', 'name_fr' => 'Auteur']);
        foreach (['nl', 'en', 'fr'] as $locale) {
            AbstractModel::setLocale($locale);
            $this->assertSame('Auteur', $role->name, "locale $locale");
        }
        $this->assertSame('Auteur', $role->getName('fr'));

        $role = $this->role(['name_nl' => null, 'name_en' => 'Issuer', 'name_fr' => 'Auteur']);
        AbstractModel::setLocale('nl');
        $this->assertSame('Issuer', $role->name);
    }

    public function testLocalizedNameInToArray(): void
    {
        $role = $this->role(['name_nl' => 'Uitgever', 'name_en' => 'Issuer', 'name_fr' => 'Auteur']);
        AbstractModel::setLocale('fr');
        $array = $role->toArray();

        $this->assertSame('Auteur', $array['name']);
        foreach (['name_nl', 'name_fr', 'name_en'] as $key) {
            $this->assertArrayNotHasKey($key, $array);
        }
    }
}
