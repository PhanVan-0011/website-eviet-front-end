import { CKEditor } from '@ckeditor/ckeditor5-react';
import coreTranslations from 'ckeditor5/translations/vi.js';
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
    TableToolbar, MediaEmbed, Indent} from 'ckeditor5';


import 'ckeditor5/ckeditor5.css';


function CustomEditor({data, onReady, onChange, trigger}) {
    return (
        <CKEditor
            editor={ ClassicEditor }
            data={data}
            config={ {
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
                    TableToolbar, MediaEmbed],
                toolbar: ['undo',
                                'redo','heading',
                                '|',
                                'bold',
                                'italic',
                                'underline',
                                'strikethrough',
                                '|',
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

export default CustomEditor;