// Define the environment variables required by the app
process.env.MONGO_CONNECT = 'mongodb://testuser:dEjVVRCDuTP56Fyh@ds051534.mongolab.com:51534/spotidrop-test';
process.env.NODE_ENV = 'dev';
process.env.MOCK_SPOTIFY = true;
process.env.NO_AUTH = true;

var expect = require('chai').expect,
  request = require('supertest'),
  index = require('./../index');

var timeout = 10 * 1000;

describe('/api/playlists', function () {
  this.timeout(timeout);

  var dummyData1,
    dummyData2,
    responseLength,
    playlistId1,
    playlistId2,
    playlistTrack;

  before(function (done) {
    // Extend timeout to allow for real DB connection to be made
    this.timeout(timeout);

    // Listen out for app init completion (including DB connection success)
    // index.onInitComplete.addOnce(done);
    index.cb = done;
  });

  after(function(done) {
    require('./helper/drop-db')(done);
  });

  beforeEach(function () {
    dummyData1 = {
      name: 'Mocha Up My Chai',
      description: 'A dummy playlist built by the test runner',
    };

    dummyData2 = {
      name: 'Everyone loves integration testing',
      description: 'A dummy playlist basking in test runner glory',
    }
  });

  // Playlist API root tests
  describe('', function () {
    describe('GET', function () {
      it('should return any existing playlists', function (done) {
        request(index.app)
          .get('/api/playlists')
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with array').to.be.an.instanceof(Array);

            done();
          });
      });
    });

    describe('POST', function () {
      it('should return a new playlist item', function (done) {
        request(index.app)
          .post('/api/playlists')
          .send(dummyData1)
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with object').to.be.an('object');

            expect(res.body._id, 'with _id').to.exist;
            expect(res.body.modified, 'with modified').to.exist;
            expect(res.body.tracks, 'with tracks array').to.be.an.instanceof(Array);
            expect(res.body.name, 'with correct name').to.equal(dummyData1.name);
            expect(res.body.description, 'with correct description').to.equal(dummyData1.description);

            // For use in a later test, should be playlist generated by dummyData1
            playlistId1 = res.body._id;

            done();
          });
      });
    });

    describe('further functionality', function () {
      it('should GET returning at least 1 playlist', function (done) {
        request(index.app)
          .get('/api/playlists')
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with array').to.be.an('array');

            // Sequence critical: We're relying on presence of data from previous `POST /` test
            expect(res.body.length, 'with items').to.be.at.least(1);

            // For use in a later test
            responseLength = res.body.length;

            // Verify item's data
            expect(res.body[res.body.length - 1]._id, 'with _id').to.exist;
            expect(res.body[res.body.length - 1].modified, 'with modified').to.exist;
            expect(res.body[res.body.length - 1].tracks, 'with tracks array').to.be.an.instanceof(Array);
            expect(res.body[res.body.length - 1].name, 'with correct name').to.equal(dummyData1.name);
            expect(res.body[res.body.length - 1].description, 'with correct description').to.equal(dummyData1.description);

            done();
          });
      });

      it('should POST returning another new playlist item', function (done) {
        // TODO: Should POST /api/playlists return all playlists?
        request(index.app)
          .post('/api/playlists')
          .send(dummyData2)
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with object').to.be.an('object');

            expect(res.body._id, 'with _id').to.exist;
            expect(res.body.modified, 'with modified').to.exist;
            expect(res.body.tracks, 'with tracks array').to.be.an.instanceof(Array);
            expect(res.body.name, 'with correct name').to.equal(dummyData2.name);
            expect(res.body.description, 'with correct description').to.equal(dummyData2.description);

            // For use in a later test, should be playlist generated by dummyData1
            playlistId2 = res.body._id;

            done();
          });
      });

      it('should GET returning additional playlist', function (done) {
        request(index.app)
          .get('/api/playlists')
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with array').to.be.an('array');

            // Sequence critical: We're relying on presence of data from previous `POST /` test
            expect(res.body.length, 'with items').to.equal(responseLength + 1);

            // Verify second most recently added item's data
            expect(res.body[res.body.length - 2]._id, 'first with _id').to.exist;
            expect(res.body[res.body.length - 2].modified, 'first with modified').to.exist;
            expect(res.body[res.body.length - 2].tracks, 'first with tracks array').to.be.an.instanceof(Array);
            expect(res.body[res.body.length - 2].name, 'first with correct name').to.equal(dummyData1.name);
            expect(res.body[res.body.length - 2].description, 'first with correct description').to.equal(dummyData1.description);

            // Verify most recently added item's data
            expect(res.body[res.body.length - 1]._id, 'second with _id').to.exist;
            expect(res.body[res.body.length - 1].modified, 'second with modified').to.exist;
            expect(res.body[res.body.length - 1].tracks, 'second with tracks array').to.be.an.instanceof(Array);
            expect(res.body[res.body.length - 1].name, 'second with correct name').to.equal(dummyData2.name);
            expect(res.body[res.body.length - 1].description, 'second with correct description').to.equal(dummyData2.description);

            done();
          });
      });
    });
  });


  describe('/:playlist_id', function () {
    var myPlaylist,
      updatedName = 'This is my updated title',
      updatedDescription1 = 'This is my updated description',
      updatedDescription2 = 'This description has been updated again!',
      playlistIdNonExist = '556f81878e00000000000000',
      playlistIdInvalidFormat = 'foo-bar';

    describe('GET', function () {
      it('should return correct playlist', function (done) {
        request(index.app)
          .get('/api/playlists/' + playlistId1)
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with object').to.be.an('object');

            expect(res.body._id, 'with _id').to.exist;
            expect(res.body._id, 'with correct _id').to.equal(playlistId1);
            expect(res.body.modified, 'with modified').to.exist;
            expect(res.body.tracks, 'with tracks array').to.be.an.instanceof(Array);
            expect(res.body.name, 'with correct name').to.equal(dummyData1.name);
            expect(res.body.description, 'with correct description').to.equal(dummyData1.description);

            // For use in a later test
            myPlaylist = res.body;

            done();
          });
      });

      it('should receive invalid format id and return Bad Request status', function (done) {
        request(index.app)
          .get('/api/playlists/' + playlistIdInvalidFormat)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(400);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });

      it('should receive non-existent id and return Not Found status', function (done) {
        request(index.app)
          .get('/api/playlists/' + playlistIdNonExist)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(404);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });
    });

    describe('PUT', function () {
      it('should receive Playlist entity and return updated playlist', function (done) {
        // Change a playlist values, prep for PUT
        myPlaylist.name = updatedName;
        myPlaylist.description = updatedDescription1;

        request(index.app)
          .put('/api/playlists/' + playlistId1)
          .send(myPlaylist)
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with object').to.be.an('object');

            expect(res.body._id, 'with _id').to.exist;
            expect(res.body._id, 'with correct _id').to.equal(playlistId1);
            expect(res.body._id, 'with correct _id').to.equal(myPlaylist._id);
            expect(res.body.modified, 'with modified').to.exist;
            expect(res.body.modified, 'with updated modified').to.be.greaterThan(myPlaylist.modified);
            expect(res.body.tracks, 'with tracks array').to.be.an.instanceof(Array);
            expect(res.body.name, 'with correct name').to.equal(updatedName);
            expect(res.body.description, 'with correct description').to.equal(updatedDescription1);

            // For use in a later test
            myPlaylist = res.body;

            done();
          });
      });

      it('should receive invalid format id and return Bad Request status', function (done) {
        request(index.app)
          .put('/api/playlists/' + playlistIdInvalidFormat)
          .send(myPlaylist)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(400);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });

      it('should receive non-existent id and return Not Found status', function (done) {
        request(index.app)
          .put('/api/playlists/' + playlistIdNonExist)
          .send(myPlaylist)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(404);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });
    });

    describe('PATCH', function () {
      it('should receive params and return updated playlist', function (done) {
        // Specify a single playlist value for PATCH
        var myPlaylistPatch = {description: updatedDescription2};

        request(index.app)
          .put('/api/playlists/' + playlistId1)
          .send(myPlaylistPatch)
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with json').to.contain('json');
            expect(res.status, 'with 200').to.equal(200);
            expect(res.body, 'with object').to.be.an('object');

            expect(res.body._id, 'with _id').to.exist;
            expect(res.body._id, 'with correct _id').to.equal(playlistId1);
            expect(res.body._id, 'with correct _id').to.equal(myPlaylist._id);
            expect(res.body.modified, 'with modified').to.exist;
            expect(res.body.modified, 'with updated modified').to.be.greaterThan(myPlaylist.modified);
            expect(res.body.tracks, 'with tracks array').to.be.an.instanceof(Array);
            expect(res.body.name, 'with correct name').to.equal(updatedName);
            expect(res.body.description, 'with correct description').to.equal(updatedDescription2);

            done();
          });
      });

      it('should receive invalid format id and return Bad Request status', function (done) {
        // Specify a single playlist value for PATCH
        var myPlaylistPatch = {description: updatedDescription2};

        request(index.app)
          .put('/api/playlists/' + playlistIdInvalidFormat)
          .send(myPlaylistPatch)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(400);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });

      it('should receive non-existent id and return Not Found status', function (done) {
        // Specify a single playlist value for PATCH
        var myPlaylistPatch = {description: updatedDescription2};

        request(index.app)
          .put('/api/playlists/' + playlistIdNonExist)
          .send(myPlaylistPatch)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(404);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });
    });

    describe('DELETE', function () {
      it('should return empty response', function (done) {
        // console.log('Attempt to delete /api/playlists/' + playlistId1);
        request(index.app)
          .delete('/api/playlists/' + playlistId1)
          .end(function (err, res) {
            if (err) throw err;

            expect(res.headers['content-type'], 'with no content-type').to.be.undefined;
            expect(res.status, 'with 204').to.equal(204);
            expect(res.body, 'with empty body').to.be.empty;

            done();
          });
      });

      it('should receive invalid format id and return Bad Request status', function (done) {
        request(index.app)
          .delete('/api/playlists/' + playlistIdInvalidFormat)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(400);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });

      it('should receive non-existent id and return Not Found status', function (done) {
        request(index.app)
          .delete('/api/playlists/' + playlistIdNonExist)
          .end(function (err, res) {
            // Note: Erroneous response is passed as first err arg
            expect(err.status, 'with 400').to.equal(404);
            expect(err.body, 'with empty body').to.be.empty;

            done();
          });
      });
    });

    describe('/tracks', function () {
      describe('POST', function () {

        this.timeout(10 * 1000);

        var dummyExternalTrack = {
          provider: 'spotify',
          foreignId: 'spotify:track:05JqOBN6XW4eFUVQlgR0I3'
        };

        it('should add a new track to a playlist and return all tracks', function (done) {
          request(index.app)
            .post('/api/playlists/' + playlistId2 + '/tracks')
            .send(dummyExternalTrack)
            .end(function (err, res) {
              if (err) throw err;

              expect(res.headers['content-type'], 'with json').to.contain('json');
              expect(res.status, 'with 200').to.equal(200);
              expect(res.body, 'with object').to.be.an('object');

              expect(res.body._id, 'with _id').to.exist;
              expect(res.body.modified, 'with modified').to.exist;
              expect(res.body.tracks, 'with tracks array').to.be.an.instanceof(Array);
              expect(res.body.name, 'with correct name').to.equal(dummyData2.name);
              expect(res.body.description, 'with correct description').to.equal(dummyData2.description);

              playlistTrack = res.body.tracks[0];

              // console.log('_____________________ playlistTrack', playlistTrack);

              done();
            });
        });

        it('should upvote a track by playlist track id', function (done) {
          request(index.app)
            .post('/api/playlists/' + playlistId2 + '/tracks/' + playlistTrack._id + '/upvote')
            .send(dummyExternalTrack)
            .end(function (err, res) {
              if (err) throw err;

              expect(res.headers['content-type'], 'with json').to.contain('json');
              expect(res.status, 'with 200').to.equal(200);
              expect(res.body, 'with object').to.be.an('object');

              expect(res.body._id, 'with _id').to.exist;
              expect(res.body.modified, 'with modified').to.exist;
              expect(res.body.track, 'with track').to.exist;
              expect(res.body.upVotes, 'with upVotes array').to.be.an.instanceof(Array);
              expect(res.body.upVotes.length, 'with more than 1 upVotes').to.be.greaterThan(1);

              playlistTrack = res.body;

              done();
            });
        });

        it('should upvote a track by actual track id', function (done) {
          request(index.app)
            .post('/api/playlists/' + playlistId2 + '/tracks/' + playlistTrack.track._id + '/upvote')
            .send(dummyExternalTrack)
            .end(function (err, res) {
              if (err) throw err;

              expect(res.headers['content-type'], 'with json').to.contain('json');
              expect(res.status, 'with 200').to.equal(200);
              expect(res.body, 'with object').to.be.an('object');

              expect(res.body._id, 'with _id').to.exist;
              expect(res.body.modified, 'with modified').to.exist;
              expect(res.body.track, 'with track').to.exist;
              expect(res.body.upVotes, 'with upVotes array').to.be.an.instanceof(Array);
              expect(res.body.upVotes.length, 'with more than 1 upVotes').to.be.greaterThan(2);

              playlistTrack = res.body;

              done();
            });
        });


      });
    });



  });


  // TODO: POST /:playlist_id/tracks

  // TODO: GET /:playlist_id/tracks/:track_id
  // TODO: DELETE /:playlist_id/tracks/:track_id

  // TODO: POST /:playlist_id/tracks/:track_id/upvote
  // TODO: DELETE /:playlist_id/tracks/:track_id/upvote

});
