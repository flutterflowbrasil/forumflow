import React from 'react';
import { Bold, Italic, Heading2, Link, Quote, Code, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onValueChange: (value: string) => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ textareaRef, onValueChange }) => {
  const applyMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const newText =
      textarea.value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      textarea.value.substring(end);

    onValueChange(newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 0);
  };

  const handleLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      applyMarkdown('[', `](${url})`);
    }
  };

  return (
    <div className="border rounded-t-md p-1 flex items-center gap-1">
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="bold" aria-label="Toggle bold" onClick={() => applyMarkdown('**', '**')}>
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic" onClick={() => applyMarkdown('*', '*')}>
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="h2" aria-label="Toggle H2" onClick={() => applyMarkdown('## ')}>
          <Heading2 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="quote" aria-label="Toggle quote" onClick={() => applyMarkdown('> ')}>
          <Quote className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="code" aria-label="Toggle code" onClick={() => applyMarkdown('`', '`')}>
          <Code className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="Toggle list" onClick={() => applyMarkdown('- ')}>
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="link" aria-label="Add link" onClick={handleLink}>
          <Link className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default MarkdownToolbar;