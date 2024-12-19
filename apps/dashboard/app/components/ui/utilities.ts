export const findNextFocusable = (
    element: Element | null,
    direction: 'next' | 'previous' = 'next'
): HTMLElement | null => {
    if (!element) return null;

    const focusableSelectors = [
        'a[href]',
        'button',
        'input',
        'select',
        'textarea',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
    ];

    const focusableElements = Array.from(
        document.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))
    );

    const currentIndex = focusableElements.indexOf(element as HTMLElement);

    if (currentIndex !== -1) {
        const nextIndex =
            direction === 'next'
                ? (currentIndex + 1) % focusableElements.length
                : (currentIndex - 1 + focusableElements.length) % focusableElements.length;

        return focusableElements[nextIndex];
    }

    return null;
};

export function classNames(...args: any[]): string {
    let classes: string[] = [];

    for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        if (!arg) continue;

        let argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            if (arg.length) {
                let inner = classNames.apply(null, arg);
                if (inner) {
                    classes.push(inner);
                }
            }
        } else if (argType === 'object') {
            if (arg.toString !== Object.prototype.toString) {
                classes.push(arg.toString());
            } else {
                for (let key in arg) {
                    if (Object.hasOwn(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }
    }

    return classes.join(' ');
}