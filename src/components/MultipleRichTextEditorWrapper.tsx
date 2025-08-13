import React from 'react';

import type { Editor } from '@tiptap/core';

import { Toolbar, TooltipProvider } from '@/components';
import { Toaster } from '@/components/ui/toaster';
import type { ToolbarProps } from '@/types';

import '../styles/index.scss';

/**
 * Interface for RichTextEditor component props
 */
export interface MultipleRichTextEditorWrapperProps {
  /** Disabled flag */
  disabled?: boolean

  /** Toolbar props */
  toolbar?: ToolbarProps

  /** Editor props */
  editor?: Editor

  /** Children components */
  children?: React.ReactNode

  className?: string
}

function MultipleRichTextEditorWrapper(props: MultipleRichTextEditorWrapperProps) {
  const { children, ...restProps } = props;

  return (
    <TooltipProvider delayDuration={0}
      disableHoverableContent
    >
      <div className={`${props.className} relative`}>
        <div className="absolute top-0 left-0 w-full bg-white z-10">
          <div className="reactjs-tiptap-editor">
            <div className="richtext-overflow-hidden">
              <div className="richtext-flex richtext-max-h-full richtext-w-full richtext-flex-col">
                <Toolbar disabled={!!restProps?.disabled}
                  editor={restProps.editor}
                  toolbar={restProps.toolbar}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        <div>
          {children}
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default MultipleRichTextEditorWrapper;
