import {describe, it, expect, vi, afterEach} from 'vitest';
import {createApp, h, nextTick, defineComponent} from 'vue';
import {createI18n} from 'vue-i18n';

import ImageThumbnail from '@/components/ImageThumbnail.vue';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

// openseadragon needs a real canvas, the masonry wall needs ResizeObserver: replace both with plain markup
vi.mock('@/components/OpenSeadragon.vue', () => ({
    default: defineComponent({
        props: ['IIIFImageUrl', 'height'],
        setup: (props) => () => h('div', {class: 'osd-stub', 'data-height': props.height}),
    }),
}));
vi.mock('@yeger/vue-masonry-wall', () => ({
    default: defineComponent({
        props: ['items'],
        setup: (props, {slots}) => () => h('div', props.items.map((item: string) => slots.default?.({item}))),
    }),
}));

const thumbnail = 'https://iiif.example/iiif/images/dibe:1/full/256,/0/default.jpg';
const text = 'In nomine <mark>domini</mark> amen';

let el: HTMLElement;
let unmount: () => void;

async function openZoom(props: object, locale = 'en') {
    el = document.createElement('div');
    document.body.appendChild(el);
    const app = createApp({render: () => h(ImageThumbnail, props)});
    app.use(createI18n({legacy: false, locale, messages: {en, fr}}));
    app.mount(el);
    unmount = () => app.unmount();
    el.querySelector<HTMLImageElement>('img')!.click();
    await nextTick();
}

const textPane = () => el.querySelector('.image-zoom__text');
const toggle = () => el.querySelector<HTMLInputElement>('.modal-header input[type=checkbox]');

afterEach(() => {
    unmount();
    el.remove();
});

describe('ImageThumbnail zoom', () => {
    it('shows only the image when there is no text', async () => {
        await openZoom({thumbnailUrls: [thumbnail]});
        expect(el.querySelector('.osd-stub')).not.toBeNull();
        expect(toggle()).toBeNull();
        expect(textPane()).toBeNull();
    });

    it('shows the image and the text side by side, with a "Show text" switch', async () => {
        await openZoom({thumbnailUrls: [thumbnail], text});
        expect(toggle()?.checked).toBe(true);
        expect(el.querySelector('.modal-header')?.textContent).toContain('Show text');
        expect(textPane()?.innerHTML).toContain('<mark>domini</mark>');
    });

    it('labels the switch in French on French pages', async () => {
        await openZoom({thumbnailUrls: [thumbnail], text}, 'fr');
        expect(el.querySelector('.modal-header')?.textContent).toContain('Afficher le texte');
    });

    it('hides the text when the switch is turned off', async () => {
        await openZoom({thumbnailUrls: [thumbnail], text});
        toggle()!.click();
        await nextTick();
        expect(textPane()).toBeNull();
        expect(el.querySelector('.osd-stub')).not.toBeNull();
    });

    it('gives the viewer a fixed height', async () => {
        await openZoom({thumbnailUrls: [thumbnail], text});
        expect(el.querySelector('.osd-stub')?.getAttribute('data-height')).toBe('70vh');
    });

    it('closes on Escape', async () => {
        await openZoom({thumbnailUrls: [thumbnail]});
        document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
        await nextTick();
        expect(el.querySelector('.modal')).toBeNull();
    });
});
