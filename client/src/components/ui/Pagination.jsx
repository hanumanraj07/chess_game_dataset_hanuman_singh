import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalCount, pageSize }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        id="pagination-prev"
      >
        ← PREV
      </button>

      {pages[0] > 1 && (
        <>
          <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
          {pages[0] > 2 && <span className="pagination-info">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
          id={`pagination-page-${p}`}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="pagination-info">…</span>}
          <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        id="pagination-next"
      >
        NEXT →
      </button>

      <span className="pagination-info" style={{ marginLeft: 'auto' }}>
        PAGE {currentPage} OF {totalPages}
        {totalCount !== undefined && ` · ${totalCount.toLocaleString()} TOTAL`}
      </span>
    </div>
  );
};

export default Pagination;
