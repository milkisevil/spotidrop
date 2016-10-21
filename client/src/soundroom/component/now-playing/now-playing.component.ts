import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';

import { Observable } from 'rxjs/Observable';

import { Playlist } from "../../shared/model/playlist";
import { PlaylistService } from "../../shared/service/playlist.service";
import { ArtistsNamesPipe } from "../../shared/pipe/artists-names.pipe";
import { TimelineComponent } from "../timeline/timeline.component";
import { PlaylistTrack } from "../../shared/model/playlist-track";

@Component({
  selector: 'now-playing',
  template: require('./now-playing.html'),
  styles: [require('./now-playing.scss')],
  directives: [TimelineComponent],
  pipes: [ArtistsNamesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NowPlayingComponent implements OnInit {

  // TODO: No need to be observable
  @Input('playlist') observablePlaylist: Observable<Playlist>;

  private playlist: Playlist;
  private playlistTrack: PlaylistTrack;
  private progress$: Observable<number>;

  constructor(private cdr: ChangeDetectorRef, private playlistService: PlaylistService) {

  }

  ngOnInit(): any {
    // console.log('NowPlaying.ngOnInit():', this.observablePlaylist);

    this.observablePlaylist.subscribe((playlist: Playlist) => {
      // console.log('NowPlaying.ngOnInit: subscribe:', playlist);
      this.playlist = playlist;

      this.playlistTrack = playlist.current
        || (playlist.tracks && playlist.tracks.length
          ? playlist.tracks[0]
          : null);

      this.cdr.markForCheck();
    });

    this.progress$ = this.observablePlaylist.map((playlist: Playlist) => playlist.current ? playlist.current.progress : 0);
  }

  play() {
    this.playlistService.play(this.playlist._id);
  }

  pause() {
    this.playlistService.pause(this.playlist._id);
  }

  togglePlay() {
    if (this.playlist.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
}
