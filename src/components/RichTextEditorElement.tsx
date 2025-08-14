import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useState } from 'react';

import type { AnyExtension, Editor as CoreEditor } from '@tiptap/core';
import type { UseEditorOptions } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { differenceBy, throttle } from 'lodash-es';

import { BubbleMenu } from '@/components';
import { Toaster } from '@/components/ui/toaster';
import { EDITOR_UPDATE_WATCH_THROTTLE_WAIT_TIME } from '@/constants';
import { RESET_CSS } from '@/constants/resetCSS';
import { editableEditorActions } from '@/store/editableEditor';
import { ProviderRichText } from '@/store/ProviderRichText';
import { themeActions } from '@/theme/theme';
import type { BubbleMenuProps, ToolbarProps } from '@/types';
import { removeCSS, updateCSS } from '@/utils/dynamicCSS';
import { hasExtension } from '@/utils/utils';

import '../styles/index.scss';
import CharactorCount from './CharactorCount';

/**
 * Interface for RichTextEditor component props
 */
export interface RichTextEditorElementProps {
  /** Content of the editor */
  content: string
  /** Extensions for the editor */
  extensions: AnyExtension[]

  /** Output format */
  output: 'html' | 'json' | 'text'
  /** Model value */
  modelValue?: string | object
  /** Dark mode flag */
  dark?: boolean
  /** Dense mode flag */
  dense?: boolean
  /** Disabled flag */
  disabled?: boolean
  /** Label for the editor */
  label?: string
  /** Hide toolbar flag */
  hideToolbar?: boolean
  /** Disable bubble menu flag */
  disableBubble?: boolean
  /** Hide bubble menu flag */
  hideBubble?: boolean
  /** Remove default wrapper flag */
  removeDefaultWrapper?: boolean
  /** Maximum width */
  maxWidth?: string | number
  /** Minimum height */
  minHeight?: string | number
  /** Maximum height */
  maxHeight?: string | number
  /** Content class */
  contentClass?: string | string[] | Record<string, any>
  /** Content change callback */
  onChangeContent?: (val: any) => void
  /** Bubble menu props */
  bubbleMenu?: BubbleMenuProps
  /** Toolbar props */
  toolbar?: ToolbarProps

  /** Use editor options */
  useEditorOptions?: UseEditorOptions

  /** Use editor options */
  resetCSS?: boolean

  /** This option gives us the control to enable the default behavior of rendering the editor immediately.*/
  immediatelyRender?: boolean

  editorId?: string;

  /** Wrapper sẽ tiêm prop này để biết editor nào đang active */
  onFocusEditor?: (editor: CoreEditor | null, id: string) => void;

  onBlurEditor?: (editor: CoreEditor | null, id: string) => void;
}

function RichTextEditorElement(props: RichTextEditorElementProps, ref: React.ForwardedRef<{ editor: CoreEditor | null }>) {
  const { content, extensions, useEditorOptions = {} } = props;
  const [isFocused, setIsFocused] = useState(false);

  const id = useId();

  const sortExtensions = useMemo(() => {
    const diff = differenceBy(extensions, extensions, 'name');
    const exts = extensions.map((k: any) => {
      const find = extensions.find((ext: any) => ext.name === k.name);
      if (!find) {
        return k;
      }
      return k.configure(find.options);
    });
    return [...exts, ...diff].map((k, i) => k.configure({ sort: i }));
  }, [extensions]);

  const onValueChange = throttle((editor) => {
    const output = getOutput(editor, props.output as any);

    props?.onChangeContent?.(output as any);
  }, EDITOR_UPDATE_WATCH_THROTTLE_WAIT_TIME);

  const editor = useEditor({
    extensions: sortExtensions,
    content,
    immediatelyRender: props?.immediatelyRender || false,
    onUpdate: ({ editor }) => {
      if (onValueChange)
        onValueChange(editor);
    },
    onBlur: ({ editor }) => {
      setIsFocused(false);
      props?.onBlurEditor?.(editor, props.editorId || id);
    },
    onFocus: ({ editor }) => {
      setIsFocused(true);
      props?.onFocusEditor?.(editor, props.editorId || id);
    },
    ...useEditorOptions,
  }) as any;

  useImperativeHandle(ref, () => {
    return {
      editor,
    };
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', props.dark);
    themeActions.setTheme(id, props.dark ? 'dark' : 'light');
  }, [props.dark]);

  useEffect(() => {
    editor?.setEditable(!props?.disabled);
    editableEditorActions.setDisable(id, !props?.disabled);
  }, [editor, props?.disabled]);

  useEffect(() => {
    if (props?.resetCSS !== false) {
      updateCSS(RESET_CSS, 'react-tiptap-reset');
    }

    return () => {
      removeCSS('react-tiptap-reset');
    };
  }, [props?.resetCSS]);

  function getOutput(editor: CoreEditor, output: RichTextEditorElementProps['output']) {
    if (props?.removeDefaultWrapper) {
      if (output === 'html') {
        return editor.isEmpty ? '' : editor.getHTML();
      }
      if (output === 'json') {
        return editor.isEmpty ? {} : editor.getJSON();
      }
      if (output === 'text') {
        return editor.isEmpty ? '' : editor.getText();
      }
      return '';
    }

    if (output === 'html') {
      return editor.getHTML();
    }
    if (output === 'json') {
      return editor.getJSON();
    }
    if (output === 'text') {
      return editor.getText();
    }
    return '';
  }

  useLayoutEffect(() => {
    if (editor) editor!.id = id;
  }, [id, editor]);

  useEffect(() => {
    return () => {
      editor?.destroy?.();
    };
  }, []);

  const hasExtensionValue = useMemo(() => {
    return hasExtension(editor, 'characterCount');
  }, [editor]);

  if (!editor) {
    return <></>;
  }

  return (
    <div className="reactjs-tiptap-editor richtext-bg-transparent">
      <ProviderRichText
        id={id}
      >
        {/* <TooltipProvider delayDuration={0}
          disableHoverableContent
        > */}
        <div className={`richtext-overflow-hidden ${isFocused ? 'richtext-bg-gray-200/10' : ''}`}>
          <div className="richtext-flex richtext-max-h-full richtext-w-full richtext-flex-col">
            {/* {!props?.hideToolbar && <Toolbar disabled={!!props?.disabled}
                editor={editor}
                toolbar={props.toolbar}
              />} */}

            <EditorContent className={`richtext-relative ${props?.contentClass || ''}`}
              editor={editor}

            />

            <div className={`${isFocused ? 'richtext-visible' : 'richtext-invisible'}`}>
              {hasExtensionValue && <CharactorCount editor={editor}
                extensions={extensions}
              />}
            </div>

            {!props?.hideBubble && <BubbleMenu bubbleMenu={props?.bubbleMenu}
              disabled={props?.disabled}
              editor={editor}
            />}
          </div>
        </div>

        {/* </TooltipProvider> */}
      </ProviderRichText>

      <Toaster />
    </div>
  );
}

export default forwardRef(RichTextEditorElement);
