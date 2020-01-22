module.exports = fn => {
    // Rtourne une fonction anonyme
    return (req, res, next) => {
      //fn est une async function => retourne une Promise, donc on utilise catch pour capturer l'erreur
      fn(req, res, next).catch(err => next(err));
    }
}