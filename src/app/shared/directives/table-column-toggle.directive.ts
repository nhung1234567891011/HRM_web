import {
    AfterViewInit,
    Directive,
    ElementRef,
    OnDestroy,
    Renderer2,
} from '@angular/core';

interface ToggleColumnItem {
    index: number;
    label: string;
    initiallyVisible: boolean;
}

@Directive({
    selector: 'p-table',
    standalone: true,
})
export class TableColumnToggleDirective implements AfterViewInit, OnDestroy {
    private toolbarEl?: HTMLElement;
    private buttonEl?: HTMLButtonElement;
    private panelEl?: HTMLElement;
    private searchInputEl?: HTMLInputElement;
    private columnListEl?: HTMLElement;

    private readonly hiddenColumnIndexes = new Set<number>();
    private readonly pendingVisibleIndexes = new Set<number>();

    private columns: ToggleColumnItem[] = [];
    private panelVisible = false;
    private isInitializing = true;

    private destroyDocumentClick?: () => void;
    private destroyDocumentKeydown?: () => void;
    private tableObserver?: MutationObserver;
    private syncTimer?: ReturnType<typeof setTimeout>;

    constructor(private host: ElementRef<HTMLElement>, private renderer: Renderer2) {}

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initToggleUi();
            this.syncColumnsFromTable();
            this.applyColumnVisibility();
            this.observeTableChanges();
            this.isInitializing = false;
        });
    }

    ngOnDestroy(): void {
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }

        this.tableObserver?.disconnect();
        this.destroyDocumentClick?.();
        this.destroyDocumentKeydown?.();

        if (this.panelEl) {
            this.panelEl.remove();
        }

        if (this.toolbarEl) {
            this.toolbarEl.remove();
        }
    }

    private initToggleUi(): void {
        const parent = this.host.nativeElement.parentElement;

        if (!parent) {
            return;
        }

        this.toolbarEl = this.renderer.createElement('div');
        this.renderer.addClass(this.toolbarEl, 'app-table-column-toggle-toolbar');

        this.buttonEl = this.renderer.createElement('button');
        this.buttonEl.type = 'button';
        this.renderer.addClass(this.buttonEl, 'app-table-column-toggle-button');
        this.buttonEl.innerHTML = '<i class="pi pi-sliders-h"></i><span>Ẩn/hiện cột</span>';

        this.buttonEl.addEventListener('click', (event) => {
            event.stopPropagation();
            this.togglePanel();
        });

        this.renderer.appendChild(this.toolbarEl, this.buttonEl);
        this.renderer.insertBefore(parent, this.toolbarEl, this.host.nativeElement);

        this.panelEl = this.renderer.createElement('div');
        this.renderer.addClass(this.panelEl, 'app-table-column-toggle-panel');
        this.panelEl.innerHTML = `
            <div class="app-table-column-toggle-title">Hiển thị cột</div>
            <div class="app-table-column-toggle-search-wrap">
                <i class="pi pi-search"></i>
                <input type="text" class="app-table-column-toggle-search" placeholder="Tìm kiếm cột" />
            </div>
            <div class="app-table-column-toggle-actions-top">
                <button type="button" data-action="all">Chọn tất cả</button>
                <button type="button" data-action="none">Bỏ tất cả</button>
            </div>
            <div class="app-table-column-toggle-list"></div>
            <div class="app-table-column-toggle-footer">
                <button type="button" data-action="close">Đóng</button>
                <button type="button" data-action="default">Mặc định</button>
                <button type="button" class="primary" data-action="apply">Áp dụng</button>
            </div>
        `;

        document.body.appendChild(this.panelEl);

        this.searchInputEl = this.panelEl.querySelector(
            '.app-table-column-toggle-search'
        ) as HTMLInputElement;
        this.columnListEl = this.panelEl.querySelector(
            '.app-table-column-toggle-list'
        ) as HTMLElement;

        this.searchInputEl?.addEventListener('input', () => this.renderColumnList());

        this.panelEl
            .querySelector('[data-action="all"]')
            ?.addEventListener('click', () => this.selectAllPending(true));
        this.panelEl
            .querySelector('[data-action="none"]')
            ?.addEventListener('click', () => this.selectAllPending(false));
        this.panelEl
            .querySelector('[data-action="close"]')
            ?.addEventListener('click', () => this.closePanel());
        this.panelEl
            .querySelector('[data-action="default"]')
            ?.addEventListener('click', () => this.resetToDefaultPending());
        this.panelEl
            .querySelector('[data-action="apply"]')
            ?.addEventListener('click', () => this.applyPendingVisibility());

        this.destroyDocumentClick = this.renderer.listen(
            'document',
            'click',
            (event: MouseEvent) => {
                if (!this.panelVisible || !this.panelEl || !this.buttonEl) {
                    return;
                }

                const target = event.target as Node;
                if (this.panelEl.contains(target) || this.buttonEl.contains(target)) {
                    return;
                }

                this.closePanel();
            }
        );

        this.destroyDocumentKeydown = this.renderer.listen(
            'document',
            'keydown',
            (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    this.closePanel();
                }
            }
        );
    }

    private togglePanel(): void {
        if (!this.panelEl || !this.buttonEl) {
            return;
        }

        if (this.panelVisible) {
            this.closePanel();
            return;
        }

        this.syncColumnsFromTable();
        this.pendingVisibleIndexes.clear();

        this.columns.forEach((column) => {
            if (!this.hiddenColumnIndexes.has(column.index)) {
                this.pendingVisibleIndexes.add(column.index);
            }
        });

        this.renderColumnList();

        const buttonRect = this.buttonEl.getBoundingClientRect();
        this.panelEl.style.display = 'block';
        this.panelEl.style.top = `${buttonRect.bottom + 8}px`;
        this.panelEl.style.left = `${Math.max(8, buttonRect.right - 330)}px`;

        this.panelVisible = true;
        this.searchInputEl?.focus();
    }

    private closePanel(): void {
        if (!this.panelEl) {
            return;
        }

        this.panelEl.style.display = 'none';
        this.panelVisible = false;
        if (this.searchInputEl) {
            this.searchInputEl.value = '';
        }
    }

    private syncColumnsFromTable(): void {
        const headerRow = this.resolveHeaderRow();

        if (!headerRow) {
            this.columns = [];
            this.updateButtonState();
            return;
        }

        const headerCells = Array.from(headerRow.children).filter(
            (cell) => cell instanceof HTMLTableCellElement
        ) as HTMLTableCellElement[];

        const nextColumns: ToggleColumnItem[] = [];

        headerCells.forEach((cell, index) => {
            const text = (cell.textContent || '').replace(/\s+/g, ' ').trim();
            if (!text) {
                return;
            }

            nextColumns.push({
                index,
                label: text,
                initiallyVisible: this.isCellVisible(cell),
            });
        });

        this.columns = nextColumns;

        const validIndexes = new Set(this.columns.map((column) => column.index));
        Array.from(this.hiddenColumnIndexes).forEach((index) => {
            if (!validIndexes.has(index)) {
                this.hiddenColumnIndexes.delete(index);
            }
        });

        this.updateButtonState();
    }

    private resolveHeaderRow(): HTMLTableRowElement | null {
        const host = this.host.nativeElement;
        const rows = Array.from(
            host.querySelectorAll(
                '.p-datatable-thead > tr, .p-datatable-scrollable-header-box table thead > tr, thead > tr'
            )
        ) as HTMLTableRowElement[];

        if (!rows.length) {
            return null;
        }

        return rows.reduce((best, current) => {
            if (!best) {
                return current;
            }

            return current.children.length > best.children.length ? current : best;
        }, rows[0]);
    }

    private isCellVisible(cell: HTMLTableCellElement): boolean {
        const computed = window.getComputedStyle(cell);
        return computed.display !== 'none' && !cell.hasAttribute('hidden');
    }

    private updateButtonState(): void {
        if (!this.buttonEl || !this.toolbarEl) {
            return;
        }

        const canToggle = this.columns.length >= 2;
        this.buttonEl.disabled = !canToggle;
        this.toolbarEl.style.display = canToggle ? 'flex' : 'none';

        if (!canToggle) {
            this.closePanel();
        }
    }

    private renderColumnList(): void {
        if (!this.columnListEl) {
            return;
        }

        const keyword = (this.searchInputEl?.value || '').trim().toLowerCase();
        this.columnListEl.innerHTML = '';

        const columnsToRender = this.columns.filter((column) =>
            column.label.toLowerCase().includes(keyword)
        );

        columnsToRender.forEach((column) => {
            const row = document.createElement('label');
            row.className = 'app-table-column-toggle-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.pendingVisibleIndexes.has(column.index);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    this.pendingVisibleIndexes.add(column.index);
                } else {
                    this.pendingVisibleIndexes.delete(column.index);
                }
            });

            const text = document.createElement('span');
            text.textContent = column.label;

            row.appendChild(checkbox);
            row.appendChild(text);
            this.columnListEl?.appendChild(row);
        });
    }

    private selectAllPending(visible: boolean): void {
        this.pendingVisibleIndexes.clear();

        if (visible) {
            this.columns.forEach((column) => this.pendingVisibleIndexes.add(column.index));
        }

        this.renderColumnList();
    }

    private resetToDefaultPending(): void {
        this.pendingVisibleIndexes.clear();

        this.columns.forEach((column) => {
            if (column.initiallyVisible) {
                this.pendingVisibleIndexes.add(column.index);
            }
        });

        this.renderColumnList();
    }

    private applyPendingVisibility(): void {
        this.hiddenColumnIndexes.clear();

        this.columns.forEach((column) => {
            if (!this.pendingVisibleIndexes.has(column.index)) {
                this.hiddenColumnIndexes.add(column.index);
            }
        });

        this.applyColumnVisibility();
        this.closePanel();
    }

    private applyColumnVisibility(): void {
        const host = this.host.nativeElement;

        const allRows = Array.from(
            host.querySelectorAll(
                '.p-datatable-thead > tr, .p-datatable-tbody > tr, .p-datatable-tfoot > tr, .p-datatable-scrollable-header-box table thead > tr, .p-datatable-scrollable-body table tbody > tr, thead > tr, tbody > tr, tfoot > tr'
            )
        ) as HTMLTableRowElement[];

        allRows.forEach((row) => {
            const cells = Array.from(row.children).filter(
                (cell) => cell instanceof HTMLTableCellElement
            ) as HTMLTableCellElement[];

            cells.forEach((cell, index) => {
                if (this.hiddenColumnIndexes.has(index)) {
                    cell.style.display = 'none';
                    return;
                }

                cell.style.removeProperty('display');
            });
        });
    }

    private observeTableChanges(): void {
        this.tableObserver = new MutationObserver(() => {
            if (this.isInitializing) {
                return;
            }

            if (this.syncTimer) {
                clearTimeout(this.syncTimer);
            }

            this.syncTimer = setTimeout(() => {
                this.syncColumnsFromTable();
                this.applyColumnVisibility();

                if (this.panelVisible) {
                    this.renderColumnList();
                }
            }, 30);
        });

        this.tableObserver.observe(this.host.nativeElement, {
            childList: true,
            subtree: true,
        });
    }
}
