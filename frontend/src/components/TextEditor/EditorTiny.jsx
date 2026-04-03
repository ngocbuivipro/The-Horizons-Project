import {  useEffect, useState, useMemo } from "react";
import {  Modal, Input, Select, Tooltip } from "antd";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import { Highlight } from "@tiptap/extension-highlight";
import { Youtube } from "@tiptap/extension-youtube";

const Icons = {
  RotateLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  RotateRight: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>,
  Bold: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/></svg>,
  Italic: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>,
  Underline: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>,
  Strikethrough: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>,
  AlignLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>,
  AlignCenter: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="21" x2="3" y1="6" y2="6"/><line x1="19" x2="5" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>,
  AlignRight: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>,
  AlignJustify: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>,
  List: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>,
  ListOrdered: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>,
  Image: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  Youtube: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>,
};

const EditorAdmin = ({ description, handleEditorChange }) => {
  const extensions = useMemo(() => [
    StarterKit.configure({
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
      link: false,
      underline: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Youtube.configure({
      controls: false,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: description,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none px-6 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      handleEditorChange(editor.getHTML());
    },
  }, [extensions]); // Dependency chỉ là extensions (đã memo)

  useEffect(() => {
    if (editor && description) {
      if (editor.getHTML() !== description) {
        editor.commands.setContent(description);
      }
    }
  }, [description, editor]);

  // --- Image Modal State ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setIsImageModalOpen(false);
      setImageUrl("");
    }
  };

  // --- Youtube Modal State ---
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const addYoutube = () => {
    if (youtubeUrl) {
      editor.commands.setYoutubeVideo({ src: youtubeUrl });
      setIsYoutubeModalOpen(false);
      setYoutubeUrl("");
    }
  };

  if (!editor) return null;

  return (
      <div className="w-full font-sans text-left">
        <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">

          {/* --- TOOLBAR --- */}
          <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm top-0 z-10">

            {/* Group 1: History & Heading */}
            <div className="flex items-center gap-1">
              <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  icon={<Icons.RotateLeft className="w-4 h-4" />}
                  tooltip="Hoàn tác"
              />
              <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  icon={<Icons.RotateRight className="w-4 h-4" />}
                  tooltip="Làm lại"
              />
              <div className="mx-1 h-5 w-px bg-gray-300"></div>

              <Select
                  defaultValue="paragraph"
                  value={editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : "paragraph"}
                  onChange={(val) => {
                    if (val === "paragraph") editor.chain().focus().setParagraph().run();
                    if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
                    if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                  }}
                  style={{ width: 110 }}
                  size="small"
                  options={[
                    { value: 'paragraph', label: 'Normal' },
                    { value: 'h1', label: 'Heading 1' },
                    { value: 'h2', label: 'Heading 2' },
                  ]}
              />
            </div>

            <div className="mx-1 h-5 w-px bg-gray-300"></div>

            {/* Group 2: Basic Format */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={<Icons.Bold className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={<Icons.Italic className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} icon={<Icons.Underline className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} icon={<Icons.Strikethrough className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} icon={<span className="bg-yellow-200 px-1 text-xs font-bold rounded text-black">H</span>} tooltip="Highlight" />
            </div>

            <div className="mx-1 h-5 w-px bg-gray-300"></div>

            {/* Group 3: Alignment */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={<Icons.AlignLeft className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={<Icons.AlignCenter className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={<Icons.AlignRight className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} icon={<Icons.AlignJustify className="w-4 h-4" />} />
            </div>

            <div className="mx-1 h-5 w-px bg-gray-300"></div>

            {/* Group 4: Lists & Media */}
            <div className="flex items-center gap-0.5">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={<Icons.List className="w-4 h-4" />} />
              <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={<Icons.ListOrdered className="w-4 h-4" />} />

              <div className="mx-1 h-5 w-px bg-gray-300"></div>

              <ToolbarButton onClick={() => setIsImageModalOpen(true)} icon={<Icons.Image className="w-4 h-4" />} tooltip="Chèn ảnh" />
              <ToolbarButton onClick={() => setIsYoutubeModalOpen(true)} icon={<Icons.Youtube className="w-4 h-4" />} tooltip="Chèn Youtube" />
            </div>

          </div>

          {/* --- EDITOR CONTENT --- */}
          <div className="bg-white flex-1 cursor-text text-gray-800" onClick={() => editor.chain().focus().run()}>
            <EditorContent editor={editor} className="min-h-[300px]" />
          </div>
        </div>

        {/* --- MODALS --- */}
        <Modal title="Chèn Hình Ảnh" open={isImageModalOpen} onCancel={() => setIsImageModalOpen(false)} onOk={addImage} okText="Chèn Ảnh">
          <Input placeholder="Nhập đường dẫn hình ảnh (URL)..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <p className="text-gray-400 text-xs mt-2">*Mẹo: Bạn cũng có thể Copy & Paste ảnh trực tiếp vào khung soạn thảo.</p>
        </Modal>

        <Modal title="Chèn Video Youtube" open={isYoutubeModalOpen} onCancel={() => setIsYoutubeModalOpen(false)} onOk={addYoutube} okText="Chèn Video">
          <Input placeholder="Dán link Youtube vào đây..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
        </Modal>
      </div>
  );
};

// --- Sub-component: Toolbar Button ---
const ToolbarButton = ({ onClick, active, disabled, icon, tooltip }) => {
  const btn = (
      <button
          onClick={(e) => {
            e.preventDefault();
            onClick();
          }}
          disabled={disabled}
          className={`
        p-1.5 rounded-md transition-all duration-200 flex items-center justify-center min-w-[32px]
        ${active ? "bg-indigo-100 text-indigo-700 shadow-sm" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"} 
        ${disabled ? "opacity-30 cursor-not-allowed" : ""}
      `}
          type="button"
      >
        {icon}
      </button>
  );

  return tooltip ? <Tooltip title={tooltip}>{btn}</Tooltip> : btn;
};

export default EditorAdmin;