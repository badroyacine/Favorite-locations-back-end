const catchAsync = require('../utils/catchAsync');
const Location = require('../models/locationModel');
const AppError = require('../utils/appError');

exports.getUserLocations = catchAsync(async (req, res, next) => {
      let query = Location.find();
      // Sorting
      if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('createdAt');
      }

      locations = await query;
      const totalLocations = await Location.countDocuments();
      
      res.status(200).json({
        status: 'success',
        totalLocations,
        locations
      });
});

exports.setUserId = (req, res, next) => {
    //Si la valeur n'a pas été renseigné dans body on prend params (le userID du middleawre protect)
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

exports.createLocation = catchAsync(async (req, res, next) => {
    const newLocation = await Location.create({
      locationName: req.body.locationName,
      comment: req.body.comment,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      user: req.body.user
    });
  
    res.status(201).json({
        status: 'success',
        data: {
          location: newLocation
        }
    })
});

exports.updateLocation = catchAsync(async (req, res, next) => {
    const location = await Location.findByIdAndUpdate(req.params.locationId ,req.body, {
      new: true,
      runValidators: true
    });

    if(!location){
      return next(new AppError('no location found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      location
    });
});

exports.deleteLocation = catchAsync(async (req, res, next) =>{
  const location = await Location.findByIdAndDelete(req.params.locationId);

  if(!location){
    return next(new appError('no location found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});