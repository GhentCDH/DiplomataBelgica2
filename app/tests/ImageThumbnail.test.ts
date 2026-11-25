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

    it('lets the viewer and the text pane fill the modal body', async () => {
        await openZoom({thumbnailUrls: [thumbnail], text});
        expect(el.querySelector('.osd-stub')?.getAttribute('data-height')).toBe('100%');
        expect((textPane() as HTMLElement | null)?.style.height).toBe('100%');
    });

    it('shows a backdrop while the modal is open', async () => {
        await openZoom({thumbnailUrls: [thumbnail]});
        expect(el.querySelector('.modal-backdrop.show')).not.toBeNull();
        el.querySelector<HTMLButtonElement>('.btn-close')!.click();
        await nextTick();
        expect(el.querySelector('.modal-backdrop')).toBeNull();
    });

    it('closes on a click outside the dialog, not inside it', async () => {
        await openZoom({thumbnailUrls: [thumbnail]});
        el.querySelector<HTMLElement>('.modal-body')!.click();
        await nextTick();
        expect(el.querySelector('.modal')).not.toBeNull();
        const modal = el.querySelector<HTMLElement>('.modal')!;
        modal.dispatchEvent(new Event('pointerdown', {bubbles: true}));
        modal.click();
        await nextTick();
        expect(el.querySelector('.modal')).toBeNull();
    });

    it('stays open when a drag starts in the image and ends outside the dialog', async () => {
        await openZoom({thumbnailUrls: [thumbnail]});
        el.querySelector<HTMLElement>('.osd-stub')!.dispatchEvent(new Event('pointerdown', {bubbles: true}));
        // the browser fires the click on the common ancestor of press and release: the modal
        el.querySelector<HTMLElement>('.modal')!.click();
        await nextTick();
        expect(el.querySelector('.modal')).not.toBeNull();
    });

    it('closes on Escape', async () => {
        await openZoom({thumbnailUrls: [thumbnail]});
        document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
        await nextTick();
        expect(el.querySelector('.modal')).toBeNull();
    });
});
