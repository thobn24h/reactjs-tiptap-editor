import React, { useMemo } from 'react';

import type { Editor } from '@tiptap/core';

import { Separator } from '@/components';
import { useLocale } from '@/locales';
import type { ToolbarItemProps, ToolbarProps } from '@/types';
import { isFunction } from '@/utils/utils';

export interface ToolbarComponentProps {
  editor?: Editor
  disabled?: boolean
  toolbar?: ToolbarProps
}

function Toolbar({ editor, disabled, toolbar }: ToolbarComponentProps) {
  const { t, lang } = useLocale();

  const toolbarItems = useMemo(() => {
    const extensions = [...(editor?.extensionManager.extensions || [])];
    const sortExtensions = extensions.sort((arr, acc) => {
      const a = (arr.options).sort ?? -1;
      const b = (acc.options).sort ?? -1;
      return a - b;
    });

    let menus: ToolbarItemProps[] = [];

    for (const extension of sortExtensions) {
      const {
        button,
        divider = false,
        spacer = false,
        toolbar = true,
      } = extension.options;
      if (!button || !isFunction(button) || !toolbar) {
        continue;
      }

      const _button: ToolbarItemProps['button'] | ToolbarItemProps['button'][] = button({
        editor,
        extension,
        t,
      });

      if (Array.isArray(_button)) {
        const menu: ToolbarItemProps[] = _button.map((k, i) => ({
          button: k,
          divider: i === _button.length - 1 ? divider : false,
          spacer: i === 0 ? spacer : false,
          type: extension.type,
          name: extension.name,
        }));
        menus = [...menus, ...menu];
        continue;
      }

      menus.push({
        button: _button,
        divider,
        spacer,
        type: extension.type,
        name: extension.name,
      });
    }
    return menus;
  }, [editor, t, lang]);

  const containerDom = (innerContent: React.ReactNode) => {
    return (
      <div
        className="!richtext-border-b richtext-px-1 richtext-py-2"
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div className="richtext-relative richtext-flex richtext-h-auto richtext-flex-wrap richtext-gap-1">
          {innerContent}
        </div>
      </div>
    );
  };

  const dom = toolbarItems.map((item: ToolbarItemProps, key) => {
    const ButtonComponent = item.button.component;

    return (
      <div className="richtext-flex richtext-items-center"
        key={`toolbar-item-${key}`}
      >
        {item?.spacer && <Separator className="!richtext-mx-[10px] !richtext-h-[16px]"
          orientation="vertical"
                         />}

        <ButtonComponent
          {...item.button.componentProps}
          disabled={disabled || item?.button?.componentProps?.disabled}
        />

        {item?.divider && <Separator className="!richtext-mx-2 !richtext-h-auto"
          orientation="vertical"
                          />}
      </div>
    );
  });

  if (toolbar && toolbar?.render && editor) {
    return toolbar.render({ editor, disabled: disabled || false }, toolbarItems, dom, containerDom);
  }

  return containerDom(dom);
}

export { Toolbar };
