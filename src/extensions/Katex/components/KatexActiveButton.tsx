import { useCallback, useEffect, useMemo, useState } from 'react';

import katex from 'katex';
import { HelpCircle } from 'lucide-react';

import { ActionButton, Button, Label, Popover, PopoverContent, PopoverTrigger } from '@/components';
import type { IKatexAttrs } from '@/extensions/Katex/Katex';
import { Katex } from '@/extensions/Katex/Katex';
import { useAttributes } from '@/hooks/useAttributes';
import { useLocale } from '@/locales';

import 'https://esm.run/mathlive';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}

function KatexActiveButton({ editor, ...props }: any) {
  const { t } = useLocale();

  const attrs = useAttributes<IKatexAttrs>(editor, Katex.name, {
    text: '',
    defaultShowPicker: false,
  });
  const { text, defaultShowPicker } = attrs;

  const [currentValue, setCurrentValue] = useState('');
  const [isOpen, setIsOpen] = useState(defaultShowPicker || false);
  const [allowClose, setAllowClose] = useState(false);

  const submit = useCallback(() => {
    editor.chain().focus().setKatex({ text: currentValue }).run();
    setCurrentValue('');
    setAllowClose(true);
    setIsOpen(false); // Đóng Popover sau khi submit
  }, [editor, currentValue]);

  useEffect(() => {
    if (defaultShowPicker) {
      setIsOpen(true);
      editor.chain().updateAttributes(Katex.name, { defaultShowPicker: false }).focus().run();
    }
  }, [editor, defaultShowPicker]);

  const formatText = useMemo(() => {
    try {
      return katex.renderToString(`${currentValue}`);
    } catch {
      return currentValue;
    }
  }, [currentValue]);

  const previewContent = useMemo(
    () => {
      if (`${currentValue}`.trim()) {
        return (
          <span contentEditable={false}
            dangerouslySetInnerHTML={{ __html: formatText || '' }}
          >
          </span>
        );
      }

      return null;
    },
    [currentValue, formatText],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && !allowClose) {
      // Nếu đang cố gắng đóng và không cho phép đóng, thì giữ nguyên trạng thái mở
      return;
    }
    setIsOpen(open);
    if (open) {
      setAllowClose(false); // Reset allowClose khi mở lại
    }
  }, [allowClose]);

  return (
    <Popover modal
      onOpenChange={handleOpenChange}
      open={isOpen}
    >
      <PopoverTrigger asChild>
        <ActionButton
          icon={props?.icon}
          tooltip={props?.tooltip}
        />
      </PopoverTrigger>

      <PopoverContent align="start"
        className="richtext-size-full richtext-p-2"
        hideWhenDetached
        side="bottom"
      >
        <Label className="richtext-mb-[6px]">
          {t('editor.formula.dialog.text')}
        </Label>

        <div className="richtext-mb-[16px] richtext-flex richtext-w-full richtext-max-w-sm richtext-items-center richtext-gap-1.5">
          <div className="richtext-relative richtext-w-full richtext-max-w-sm">
            {/* <Textarea
              autoFocus
              className="richtext-w-full"
              defaultValue={text}
              onChange={e => setCurrentValue(e.target.value)}
              placeholder="Text"
              required
              rows={3}
              value={currentValue}
            /> */}

            <math-field 
              onInput={evt => setCurrentValue(evt.target.value)}
            >
              {currentValue}
            </math-field>
          </div>
        </div>

        {previewContent && (
          <div className="richtext-my-[10px] richtext-max-w-[286px] richtext-overflow-auto richtext-whitespace-nowrap richtext-rounded-[6px] !richtext-border richtext-p-[10px]">
            {previewContent}
          </div>
        )}

        <div className="richtext-flex richtext-items-center richtext-justify-between richtext-gap-[6px]">
          <Button className="richtext-flex-1"
            onClick={submit}
          >
            Submit 2
          </Button>

          <a href="https://katex.org/docs/supported"
            rel="noreferrer noopener"
            target="_blank"
          >
            <HelpCircle size={16} />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default KatexActiveButton;
