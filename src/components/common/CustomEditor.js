import { CKEditor } from '@ckeditor/ckeditor5-react';
import coreTranslations from 'ckeditor5/translations/vi.js';
import CustomUploadAdapter from '../../helpers/CustomUploadAdapter';
import {  ClassicEditor, 
    Essentials, 
    Paragraph, 
    Bold, 
    Italic,
    Underline,
    Strikethrough,
    Heading,
    List,
    Link,
    BlockQuote,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Table,
    TableToolbar,
    MediaEmbed,
    Indent,
    Alignment
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

function CustomEditor({data, onReady, onChange, trigger}) {
    return (
        <CKEditor
            editor={ ClassicEditor }
            data={data}
            config={ {
                extraPlugins: [MyCustomUploadAdapterPlugin],
                 language: {
                      ui: 'vi',
                      content: 'vi'
                  },
                licenseKey: 'GPL', // Or 'GPL'.
                plugins: [ Essentials,
                    Paragraph,
                    Bold,
                    Italic,
                    Underline,
                    Strikethrough,
                    Heading,
                    List,
                    Indent,
                    Link,
                    BlockQuote,
                    Image,
                    ImageCaption,
                    ImageStyle,
                    ImageToolbar,
                    ImageUpload,
                    Table,
                    TableToolbar, MediaEmbed, Alignment],
                toolbar: ['undo',
                                'redo','heading',
                                '|',
                                'bold',
                                'italic',
                                'underline',
                                'strikethrough',
                                '|',
                                'alignment',
                                'bulletedList',
                                'numberedList',
                                'indent',
                                'outdent',  
                                '|',
                                'link',
                                'blockQuote',
                                'insertTable',
                                'imageUpload',
                                'mediaEmbed',
                                    '|',
                                ],
                initialData: '',
                translations: [
                  coreTranslations,
                ]
            
            } }
           
             onChange={(_, editor) => {
                if (onChange) onChange(editor.getData());
                trigger && trigger();
            }}
            
            onReady={ ( editor ) => {
                if (onReady) onReady(editor);
            } }
            
        />
    );
}
// Plugin để inject custom upload adapter
function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new CustomUploadAdapter(loader);
    };
}

export default CustomEditor;