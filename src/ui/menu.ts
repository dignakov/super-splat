import { Container, Element, Label } from '@playcanvas/pcui';

import { Events } from '../events';
import { recentFiles } from '../recent-files';
import { localize } from './localization';
import { MenuPanel, MenuItem } from './menu-panel';
import selectDelete from './svg/delete.svg';
import sceneExport from './svg/export.svg';
import sceneImport from './svg/import.svg';
import sceneNew from './svg/new.svg';
import sceneOpen from './svg/open.svg';
import scenePublish from './svg/publish.svg';
import sceneSave from './svg/save.svg';
import selectAll from './svg/select-all.svg';
import selectDuplicate from './svg/select-duplicate.svg';
import selectInverse from './svg/select-inverse.svg';
import selectLock from './svg/select-lock.svg';
import selectNone from './svg/select-none.svg';
import selectSeparate from './svg/select-separate.svg';
import selectUnlock from './svg/select-unlock.svg';

const createSvg = (svgString: string) => {
    const decodedStr = decodeURIComponent(svgString.substring('data:image/svg+xml,'.length));
    return new Element({
        dom: new DOMParser().parseFromString(decodedStr, 'image/svg+xml').documentElement
    });
};

const getOpenRecentItems = async (events: Events) => {
    const files = await recentFiles.get();
    const items: MenuItem[] = files.map((file) => {
        return {
            text: file.name,
            onSelect: () => events.invoke('doc.openRecent', file.handle)
        };
    });

    if (items.length > 0) {
        items.push({}); // separator
        items.push({
            text: localize('menu.file.open-recent.clear'),
            icon: createSvg(selectDelete),
            onSelect: () => recentFiles.clear()
        });
    }

    return items;
};

class Menu extends Container {
    constructor(events: Events, args = {}) {
        args = {
            ...args,
            id: 'menu'
        };

        super(args);

        const menubar = new Container({
            id: 'menu-bar'
        });

        menubar.dom.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
        });

        const scene = new Label({
            text: localize('menu.file'),
            class: 'menu-option'
        });

        const selection = new Label({
            text: localize('menu.select'),
            class: 'menu-option'
        });

        const buttonsContainer = new Container({
            id: 'menu-bar-options'
        });
        buttonsContainer.append(scene);
        buttonsContainer.append(selection);

        menubar.append(buttonsContainer);

        const exportMenuPanel = new MenuPanel([{
            text: localize('menu.file.export.ply'),
            icon: createSvg(sceneExport),
            isEnabled: () => !events.invoke('scene.empty'),
            onSelect: () => events.invoke('scene.export', 'ply')
        }, {
            text: localize('menu.file.export.splat'),
            icon: createSvg(sceneExport),
            isEnabled: () => !events.invoke('scene.empty'),
            onSelect: () => events.invoke('scene.export', 'splat')
        }, {
            // separator
        }, {
            text: localize('menu.file.export.viewer', { ellipsis: true }),
            icon: createSvg(sceneExport),
            isEnabled: () => !events.invoke('scene.empty'),
            onSelect: () => events.invoke('scene.export', 'viewer')
        }]);

        const openRecentMenuPanel = new MenuPanel([]);

        const fileMenuPanel = new MenuPanel([{
            text: localize('menu.file.new'),
            icon: createSvg(sceneNew),
            isEnabled: () => !events.invoke('scene.empty'),
            onSelect: () => events.invoke('doc.new')
        }, {
            text: localize('menu.file.open'),
            icon: createSvg(sceneOpen),
            onSelect: async () => {
                await events.invoke('doc.open');
            }
        }, {
            text: localize('menu.file.open-recent'),
            icon: createSvg(sceneOpen),
            subMenu: openRecentMenuPanel,
            isEnabled: async () => {
                // refresh open recent menu items when the parent menu is opened
                try {
                    const items = await getOpenRecentItems(events);
                    openRecentMenuPanel.setItems(items);
                    return items.length > 0;
                } catch (error) {
                    console.error('Failed to load recent files:', error);
                    return false;
                }
            }
        }, {
            // separator
        }, {
            text: localize('menu.file.save'),
            icon: createSvg(sceneSave),
            isEnabled: () => events.invoke('doc.name'),
            onSelect: async () => await events.invoke('doc.save')
        }, {
            text: localize('menu.file.save-as', { ellipsis: true }),
            icon: createSvg(sceneSave),
            isEnabled: () => !events.invoke('scene.empty'),
            onSelect: async () => await events.invoke('doc.saveAs')
        }, {
            // separator
        }, {
            text: localize('menu.file.import', { ellipsis: true }),
            icon: createSvg(sceneImport),
            onSelect: async () => {
                await events.invoke('scene.import');
            }
        }, {
            text: localize('menu.file.export'),
            icon: createSvg(sceneExport),
            subMenu: exportMenuPanel
        }, {
            text: localize('menu.file.publish', { ellipsis: true }),
            icon: createSvg(scenePublish),
            isEnabled: () => !events.invoke('scene.empty'),
            onSelect: async () => await events.invoke('show.publishSettingsDialog')
        }]);

        const selectionMenuPanel = new MenuPanel([{
            text: localize('menu.select.all'),
            icon: createSvg(selectAll),
            extra: 'Ctrl + A',
            onSelect: () => events.fire('select.all')
        }, {
            text: localize('menu.select.none'),
            icon: createSvg(selectNone),
            extra: 'Shift + A',
            onSelect: () => events.fire('select.none')
        }, {
            text: localize('menu.select.invert'),
            icon: createSvg(selectInverse),
            extra: 'Ctrl + I',
            onSelect: () => events.fire('select.invert')
        }, {
            // separator
        }, {
            text: localize('menu.select.lock'),
            icon: createSvg(selectLock),
            extra: 'H',
            isEnabled: () => events.invoke('selection.splats'),
            onSelect: () => events.fire('select.hide')
        }, {
            text: localize('menu.select.unlock'),
            icon: createSvg(selectUnlock),
            extra: 'U',
            onSelect: () => events.fire('select.unhide')
        }, {
            text: localize('menu.select.delete'),
            icon: createSvg(selectDelete),
            extra: 'Delete',
            isEnabled: () => events.invoke('selection.splats'),
            onSelect: () => events.fire('select.delete')
        }, {
            text: localize('menu.select.reset'),
            onSelect: () => events.fire('scene.reset')
        }, {
            // separator
        }, {
            text: localize('menu.select.duplicate'),
            icon: createSvg(selectDuplicate),
            isEnabled: () => events.invoke('selection.splats'),
            onSelect: () => events.fire('select.duplicate')
        }, {
            text: localize('menu.select.separate'),
            icon: createSvg(selectSeparate),
            isEnabled: () => events.invoke('selection.splats'),
            onSelect: () => events.fire('select.separate')
        }]);

        this.append(menubar);
        this.append(fileMenuPanel);
        this.append(openRecentMenuPanel);
        this.append(exportMenuPanel);
        this.append(selectionMenuPanel);

        const options: { dom: HTMLElement, menuPanel: MenuPanel }[] = [{
            dom: scene.dom,
            menuPanel: fileMenuPanel
        }, {
            dom: selection.dom,
            menuPanel: selectionMenuPanel
        }];

        options.forEach((option) => {
            const activate = () => {
                option.menuPanel.position(option.dom, 'bottom', 2);
                options.forEach((opt) => {
                    opt.menuPanel.hidden = opt !== option;
                });
            };

            option.dom.addEventListener('pointerdown', (event: PointerEvent) => {
                if (!option.menuPanel.hidden) {
                    option.menuPanel.hidden = true;
                } else {
                    activate();
                }
            });

            option.dom.addEventListener('pointerenter', (event: PointerEvent) => {
                if (!options.every(opt => opt.menuPanel.hidden)) {
                    activate();
                }
            });
        });

        const checkEvent = (event: PointerEvent) => {
            if (!this.dom.contains(event.target as Node)) {
                options.forEach((opt) => {
                    opt.menuPanel.hidden = true;
                });
            }
        };

        window.addEventListener('pointerdown', checkEvent, true);
        window.addEventListener('pointerup', checkEvent, true);
    }
}

export { Menu };
