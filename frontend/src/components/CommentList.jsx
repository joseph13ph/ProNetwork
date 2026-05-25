const CommentList = ({ comments = [] }) => {
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-3 rounded-xl2 bg-white/70 p-3 dark:bg-slate-950/20">
          <img src={c.User?.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.User?.nombre || "U")}&background=8b5cf6&color=fff`} alt="avatar" className="h-8 w-8 rounded-xl object-cover" />
          <div>
            <div className="flex items-center gap-2">
              <span className="block text-sm font-semibold">{c.User?.nombre} {c.User?.apellido}</span>
              <span className="text-xs text-mediumGray">Hace un rato</span>
            </div>
            <p className="text-sm text-mediumGray">{c.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
