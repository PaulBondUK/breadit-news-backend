exports.formatDates = list => {
  return list.map(article => {
    return {
      ...article,
      created_at: new Date(article.created_at)
    };
  });
};

exports.makeRefObj = list => {
  const refObj = {};
  list.forEach(article => {
    refObj[article.title] = article.article_id;
  });
  return refObj;
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(comment => {
    const newObj = { ...comment };
    newObj.article_id = articleRef[comment.belongs_to];
    delete newObj.belongs_to;
    newObj.author = comment.created_by;
    delete newObj.created_by;
    return newObj;
  });
};
