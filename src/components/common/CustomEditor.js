import { CKEditor } from '@ckeditor/ckeditor5-react';
import coreTranslations from 'ckeditor5/translations/vi.js';
import CustomUploadAdapter from '../../helpers/CustomUploadAdapter';
import { useMemo, useRef } from 'react';
import { deleteImage } from '../../helpers/imageUtils';
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
    Alignment,
    ImageResize,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

function CustomEditor({data, onReady, onChange, trigger, folder = 'posts', autoDeleteImages = true}) {

    // Track các ảnh đã upload trong session này
    const uploadedImages = useRef(new Set());

    // Handle onReady và inject adapter
    const handleReady = (editor) => {
        // Inject upload adapter với khả năng track ảnh
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new CustomUploadAdapter(loader, folder, uploadedImages.current);
        };

        // Nếu bật tính năng tự động xóa ảnh
        if (autoDeleteImages) {
            // Lắng nghe thay đổi nội dung editor
            editor.model.document.on('change:data', () => {
                const editorData = editor.getData();
                
                // Kiểm tra các ảnh đã upload nhưng không còn trong nội dung
                uploadedImages.current.forEach(imageUrl => {
                    if (!editorData.includes(imageUrl)) {
                        // Ảnh đã bị xóa khỏi nội dung, gọi API xóa với thông tin folder
                        deleteImage(imageUrl, folder)
                            .then(() => {
                                uploadedImages.current.delete(imageUrl);
                                console.log('Đã xóa ảnh khỏi server:', imageUrl);
                            })
                            .catch(error => {
                                console.warn('Không thể xóa ảnh khỏi server:', imageUrl, error);
                            });
                    }
                });
            });
        }
        
        if (onReady) onReady(editor);
    };

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
                    TableToolbar, MediaEmbed, Alignment,ImageResize],
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
            
            onReady={handleReady}
            
        />
    );
}
// Plugin để inject custom upload adapter đã được di chuyển vào trong component

export default CustomEditor;