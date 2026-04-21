declare module "react-monaco-editor" {
  import * as React from "react";

  export type MonacoEditorProps = {
    language?: string;
    value?: string;
    theme?: string;
    width?: string | number;
    height?: string | number;
    options?: Record<string, unknown>;
    onChange?: (newValue: string) => void;
    editorDidMount?: (editor: any, monaco: any) => void;
  };

  export default class MonacoEditor extends React.Component<MonacoEditorProps> {}
}
