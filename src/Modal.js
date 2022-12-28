export default function Modal({ open, title, content, actions }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal">
      <div className="container">
        {title && <p className="title">{title}</p>}
        {content && <p className="content">{content}</p>}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
}
