import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

// Interface for pending delayed calls
interface PendingDelayedCall {
    executeTime: number;
    callback: () => void;
}

// Interface to hold combined track data
interface TrackData {
    asset: AudioTrackAsset | RemoteReferenceAsset;
    artist: string;
    title: string;
    isRemote: boolean;
}

@component
export class SimpleMusicPlayerManager extends BaseScriptComponent {
    // --- Local Tracks Inputs ---
    @input() localTracks: AudioTrackAsset[];
    @input() localTrackTitles: string[];
    @input() localTrackArtists: string[];
    
    // --- Remote Tracks Inputs ---
    @input() remoteTracks: RemoteReferenceAsset[];
    @input() remoteTrackTitles: string[];
    @input() remoteTrackArtists: string[];
    
    @input('Component.AudioComponent') audioComponent: AudioComponent;
    
    @input('Component.ScriptComponent') playPauseButton: PinchButton;
    @input('Component.ScriptComponent') nextTrackButton: PinchButton;
    @input('Component.ScriptComponent') prevTrackButton: PinchButton;

    @input('SceneObject') playIcon: SceneObject | null = null;
    @input('SceneObject') pauseIcon: SceneObject | null = null;

    @input('Component.Text') trackTitleText: Text | null = null;
    @input('Component.Text') artistNameText: Text | null = null;
    
    @input('bool') loopPlayback: boolean = true;
    @input('number') volume: number = 1.0;

    // --- Private variables ---
    private allTracksData: TrackData[] = [];
    private currentTrackIndex: number = 0;
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private audioInitialized: boolean = false;
    private isProcessing: boolean = false; // Protection contre les clics multiples
    private isLoadingRemote: boolean = false;
    private isManualStop: boolean = false;
    private expectTrackFinish: boolean = false;
    
    private lastPinchTimePlayPause: number = 0;
    private lastPinchTimeNext: number = 0;
    private lastPinchTimePrev: number = 0;
    private readonly DEBOUNCE_TIME = 0.5;
    private pendingDelayedCalls: PendingDelayedCall[] = [];

    // --- Callbacks ---
    private onPlayPauseCallback: (event: InteractorEvent) => void;
    private onNextTrackCallback: (event: InteractorEvent) => void;
    private onPrevTrackCallback: (event: InteractorEvent) => void;
    private onTrackFinishedCallback: (audioComponent: AudioComponent) => void;

    // --- Core Methods ---
    onAwake(): void {
        if (!this.validateInputs()) {
            print("SimpleMusicPlayerManager Error: Input validation failed. Script will not run.");
            return;
        }

        this.combineTrackData();
        this.setupCallbacks();
        this.updatePlayPauseIcons();
        this.updateTrackInfoUI();
        this.startMusicAutomatically();

        this.createEvent("UpdateEvent").bind(() => {
            this.checkDelayedCalls();
        });

        print(`SimpleMusicPlayerManager Initialized with ${this.localTracks?.length || 0} local, ${this.remoteTracks?.length || 0} remote. Total: ${this.allTracksData.length} tracks. Auto-playing.`);
    }

    // --- Combine Track Data ---
    private combineTrackData(): void {
        this.allTracksData = [];
        
        // Add local tracks
        if (this.localTracks) {
            for (let i = 0; i < this.localTracks.length; i++) {
                if (this.localTracks[i] && 
                    this.localTrackArtists?.[i] !== undefined && 
                    this.localTrackTitles?.[i] !== undefined) {
                    this.allTracksData.push({
                        asset: this.localTracks[i],
                        artist: this.localTrackArtists[i],
                        title: this.localTrackTitles[i],
                        isRemote: false
                    });
                }
            }
        }
        
        // Add remote tracks
        if (this.remoteTracks) {
            for (let i = 0; i < this.remoteTracks.length; i++) {
                if (this.remoteTracks[i] && 
                    this.remoteTrackArtists?.[i] !== undefined && 
                    this.remoteTrackTitles?.[i] !== undefined) {
                    this.allTracksData.push({
                        asset: this.remoteTracks[i],
                        artist: this.remoteTrackArtists[i],
                        title: this.remoteTrackTitles[i],
                        isRemote: true
                    });
                }
            }
        }
    }

    // --- Delayed Call System ---
    private delayedCall(delay: number, callback: () => void): void {
        if (!callback) return;
        if (delay <= 0) {
            try {
                callback();
            } catch (e) {
                print(`Error in immediate callback: ${e}`);
            }
            return;
        }
        
        const executeTime = getTime() + delay;
        this.pendingDelayedCalls.push({ executeTime, callback });
    }

    private checkDelayedCalls(): void {
        if (this.pendingDelayedCalls.length === 0) return;
        
        const currentTime = getTime();
        for (let i = this.pendingDelayedCalls.length - 1; i >= 0; i--) {
            const call = this.pendingDelayedCalls[i];
            if (currentTime >= call.executeTime) {
                this.pendingDelayedCalls.splice(i, 1);
                try {
                    call.callback();
                } catch (e) {
                    print(`Error in delayed callback: ${e}`);
                }
            }
        }
    }

    // --- Validation ---
    private validateInputs(): boolean {
        let isValid = true;
        
        // Validation de l'AudioComponent
        if (!this.audioComponent) {
            print("SimpleMusicPlayerManager Error: Audio component not defined.");
            isValid = false;
        } else {
            if (!this.audioComponent.enabled || !this.audioComponent.getSceneObject().enabled) {
                print("SimpleMusicPlayerManager Error: The AudioComponent or its SceneObject is disabled in the Inspector!");
                isValid = false;
            }
        }
        
        // Validation des pistes locales
        const numLocalTracks = this.localTracks?.length || 0;
        if (numLocalTracks > 0) {
            if (!this.localTrackTitles || this.localTrackTitles.length !== numLocalTracks) {
                print(`SimpleMusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) vs titles (${this.localTrackTitles?.length || 0}).`);
                isValid = false;
            }
            if (!this.localTrackArtists || this.localTrackArtists.length !== numLocalTracks) {
                print(`SimpleMusicPlayerManager Error: Mismatch local tracks (${numLocalTracks}) vs artists (${this.localTrackArtists?.length || 0}).`);
                isValid = false;
            }
            if (this.localTracks.some(track => track == null)) {
                print("SimpleMusicPlayerManager Error: One or more local tracks are null.");
                isValid = false;
            }
        }
        
        // Validation des pistes distantes
        const numRemoteTracks = this.remoteTracks?.length || 0;
        if (numRemoteTracks > 0) {
            if (!this.remoteTrackTitles || this.remoteTrackTitles.length !== numRemoteTracks) {
                print(`SimpleMusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) vs titles (${this.remoteTrackTitles?.length || 0}).`);
                isValid = false;
            }
            if (!this.remoteTrackArtists || this.remoteTrackArtists.length !== numRemoteTracks) {
                print(`SimpleMusicPlayerManager Error: Mismatch remote tracks (${numRemoteTracks}) vs artists (${this.remoteTrackArtists?.length || 0}).`);
                isValid = false;
            }
            if (this.remoteTracks.some(track => track == null)) {
                print("SimpleMusicPlayerManager Error: One or more remote tracks are null.");
                isValid = false;
            }
        }
        
        // Vérifier qu'il y a au moins des pistes
        if (numLocalTracks === 0 && numRemoteTracks === 0) {
            print("SimpleMusicPlayerManager Error: No tracks provided (local or remote).");
            isValid = false;
        }
        
        // Avertissements pour les composants optionnels
        if (!this.playPauseButton) print("SimpleMusicPlayerManager Warning: Play/Pause button not defined.");
        if (!this.nextTrackButton) print("SimpleMusicPlayerManager Warning: Next Track button not defined.");
        if (!this.prevTrackButton) print("SimpleMusicPlayerManager Warning: Previous Track button not defined.");
        if (!this.playIcon) print("SimpleMusicPlayerManager Warning: Play icon not defined.");
        if (!this.pauseIcon) print("SimpleMusicPlayerManager Warning: Pause icon not defined.");
        if (!this.trackTitleText) print("SimpleMusicPlayerManager Warning: Track Title Text component not defined.");
        if (!this.artistNameText) print("SimpleMusicPlayerManager Warning: Artist Name Text component not defined.");

        return isValid;
    }

    // --- Setup Callbacks ---
    private setupCallbacks(): void {
        // Setup Play/Pause button
        if (this.playPauseButton) {
            this.onPlayPauseCallback = (event: InteractorEvent) => {
                const currentTime = getTime();
                if (currentTime - this.lastPinchTimePlayPause < this.DEBOUNCE_TIME) return;
                if (this.isProcessing) return;
                
                this.lastPinchTimePlayPause = currentTime;
                this.togglePlayPause();
            };
            this.playPauseButton.onButtonPinched.add(this.onPlayPauseCallback);
        }

        // Setup Next Track button
        if (this.nextTrackButton) {
            this.onNextTrackCallback = (event: InteractorEvent) => {
                const currentTime = getTime();
                if (currentTime - this.lastPinchTimeNext < this.DEBOUNCE_TIME) return;
                if (this.isProcessing) return;
                
                this.lastPinchTimeNext = currentTime;
                this.playNextTrack();
            };
            this.nextTrackButton.onButtonPinched.add(this.onNextTrackCallback);
        }

        // Setup Previous Track button
        if (this.prevTrackButton) {
            this.onPrevTrackCallback = (event: InteractorEvent) => {
                const currentTime = getTime();
                if (currentTime - this.lastPinchTimePrev < this.DEBOUNCE_TIME) return;
                if (this.isProcessing) return;
                
                this.lastPinchTimePrev = currentTime;
                this.playPrevTrack();
            };
            this.prevTrackButton.onButtonPinched.add(this.onPrevTrackCallback);
        }

        // Setup track finished callback
        this.onTrackFinishedCallback = (audioComponent: AudioComponent) => {
            if (!this.expectTrackFinish || audioComponent !== this.audioComponent || !this.isPlaying || this.isLoadingRemote || this.isManualStop || this.isPaused) {
                if (this.isManualStop) this.isManualStop = false;
                return;
            }
            
            print("Background track finished, auto-playing next.");
            this.expectTrackFinish = false;
            this.handleAutoAdvance();
        };

        if (this.audioComponent) {
            this.audioComponent.setOnFinish(this.onTrackFinishedCallback);
        }
    }

    // --- Music Control ---
    private startMusicAutomatically(): void {
        if (!this.allTracksData || this.allTracksData.length === 0) return;
        this.currentTrackIndex = 0;
        this.loadTrack(this.currentTrackIndex, true);
    }

    private loadTrack(index: number, playImmediately: boolean): void {
        this.expectTrackFinish = false;
        
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        try {
            if (index < 0 || index >= this.allTracksData.length) {
                print(`Invalid track index: ${index}`);
                return;
            }
            
            if (!this.audioComponent) {
                print("Audio component not available");
                return;
            }

            const trackData = this.allTracksData[index];
            if (!trackData) {
                print(`Track data not available for index ${index}`);
                return;
            }

            // Arrêter la piste actuelle si elle joue
            if (this.audioInitialized) {
                this.audioComponent.stop(false);
            }

            this.currentTrackIndex = index;
            this.audioInitialized = false;
            this.isManualStop = false;
            
            // Stop current playback
            if ((this.isPlaying || this.isPaused) && this.audioComponent) {
                if (this.audioComponent.isPlaying() || this.audioComponent.isPaused()) {
                    print("Stopping previous track...");
                    try {
                        this.audioComponent.stop(false);
                    } catch (e) {
                        print("Error stopping previous: " + e);
                    }
                }
            }
            
            this.isPlaying = false;
            this.isPaused = false;
            
            if (this.audioComponent) {
                try {
                    this.audioComponent.audioTrack = null;
                } catch (e) {}
            }
            
            this.updateTrackInfoUI();
            
            print(`Loading track ${index}: ${trackData.title} by ${trackData.artist} (${trackData.isRemote ? 'Remote' : 'Local'}) - Play: ${playImmediately}`);

            if (trackData.isRemote) {
                // Remote track loading
                this.isLoadingRemote = true;
                const remoteAsset = trackData.asset as RemoteReferenceAsset;
                
                const onDownloaded = (asset: Asset) => {
                    if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                        print(`Download callback ignored for index ${index}`);
                        this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote);
                        return;
                    }
                    
                    this.isLoadingRemote = false;
                    
                    if (asset && asset.isOfType("Asset.AudioTrackAsset")) {
                        const audioTrack = asset as AudioTrackAsset;
                        print(`Successfully downloaded: ${trackData.title}`);
                        
                        if (!this.audioComponent) {
                            print("Error: AudioComponent missing after download");
                            this.handleLoadError(index, "AudioComponent missing");
                            return;
                        }
                        
                        try {
                            this.audioComponent.audioTrack = audioTrack;
                            this.audioInitialized = true;
                            
                            if (playImmediately) {
                                print("Auto-playing downloaded remote track.");
                                this.delayedCall(0.05, () => this.playTrack());
                            } else {
                                print(`Remote track loaded: ${trackData.title}. Ready to play.`);
                            }
                            
                            this.updatePlayPauseIcons();
                            this.updateTrackInfoUI();
                        } catch (error) {
                            print(`Error setting downloaded track: ${error}`);
                            this.handleLoadError(index, "Failed to set track");
                        }
                    } else {
                        const assetType = asset ? asset.getTypeName() : "null";
                        print(`Error: Downloaded asset has invalid type: ${assetType}`);
                        this.handleLoadError(index, "Invalid asset type");
                    }
                };
                
                const onFailed = () => {
                    if (this.currentTrackIndex !== index || !this.isLoadingRemote) {
                        print(`Download failure callback ignored for index ${index}`);
                        this.isLoadingRemote = (this.currentTrackIndex === index && this.isLoadingRemote);
                        return;
                    }
                    
                    this.isLoadingRemote = false;
                    print(`Error: Download failed for track ${index}.`);
                    this.handleLoadError(index, "Download failed");
                };
                
                try {
                    print(`Starting download for: "${trackData.title}"`);
                    remoteAsset.downloadAsset(onDownloaded, onFailed);
                } catch (error) {
                    print("Error initiating download: " + error);
                    this.isLoadingRemote = false;
                    this.handleLoadError(index, "Download initialization failed");
                }
            } else {
                // Local track loading
                if (!this.audioComponent) {
                    print("Error: AudioComponent missing for local track");
                    this.handleLoadError(index, "AudioComponent missing");
                    return;
                }
                
                try {
                    const localAsset = trackData.asset as AudioTrackAsset;
                    this.audioComponent.audioTrack = localAsset;
                    this.audioInitialized = true;
                    
                    print(`Local track loaded: ${trackData.title}`);
                    
                    if (playImmediately) {
                        print("Auto-playing local track.");
                        this.delayedCall(0.05, () => this.playTrack());
                    } else {
                        print(`Local track loaded: ${trackData.title}. Ready to play.`);
                    }
                    
                    this.updatePlayPauseIcons();
                    this.updateTrackInfoUI();
                } catch (error) {
                    print(`Error loading local track: ${error}`);
                    this.handleLoadError(index, "Local track load error");
                }
            }
            
        } catch (error) {
            print(`Error loading track ${index}: ${error}`);
            this.handleLoadError(index, "General load error");
        } finally {
            this.isProcessing = false;
        }
    }

    private handleLoadError(failedIndex: number, reason: string): void {
        print(`Handle load error for track ${failedIndex}: ${reason}`);
        
        if (this.currentTrackIndex === failedIndex) {
            // Reset state for current track
            this.isPlaying = false;
            this.isPaused = false;
            this.audioInitialized = false;
            this.isLoadingRemote = false;
            
            if (this.audioComponent) {
                try {
                    this.audioComponent.audioTrack = null;
                } catch (e) {}
            }
            
            this.updatePlayPauseIcons();
            this.updateTrackInfoUI();
        } else {
            print(`Load error for track ${failedIndex} ignored, current track is ${this.currentTrackIndex}.`);
        }
    }

    private playTrack(): void {
        if (this.isLoadingRemote) {
            print("Play ignored: Loading remote track.");
            return;
        }
        
        if (!this.audioInitialized || !this.audioComponent || !this.audioComponent.audioTrack) {
            print(`Cannot play: Track not initialized.`);
            if (this.currentTrackIndex !== -1) {
                this.loadTrack(this.currentTrackIndex, true);
            }
            return;
        }
        
        try {
            this.expectTrackFinish = true;
            const trackData = this.allTracksData[this.currentTrackIndex];
            const title = trackData?.title || "Unknown";
            
            if (this.isPaused) {
                print(`Resuming: ${title}`);
                this.audioComponent.resume();
                this.isPlaying = true;
                this.isPaused = false;
            } else if (!this.isPlaying) {
                print(`Starting: ${title}`);
                this.audioComponent.play(this.volume);
                this.isPlaying = true;
                this.isPaused = false;
            } else {
                print(`Play called while already playing ${title}.`);
                this.expectTrackFinish = this.isPlaying;
            }
            
            this.isManualStop = false;
            this.updatePlayPauseIcons();
        } catch (error) {
            print(`Error playing/resuming track: ${error}`);
            this.expectTrackFinish = false;
            this.handleLoadError(this.currentTrackIndex, "Playback error");
        }
    }

    public togglePlayPause(): void {
        if (this.isLoadingRemote) {
            print("Play/Pause ignored: Loading remote track.");
            return;
        }
        
        if (this.allTracksData.length === 0) {
            print("Play/Pause ignored: No tracks available.");
            return;
        }
        
        if (!this.audioInitialized) {
            this.startMusicAutomatically();
            return;
        }

        if (this.isPlaying) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }

    private pauseMusic(): void {
        if (!this.audioComponent || !this.isPlaying) return;
        
        try {
            this.audioComponent.pause();
            this.isPlaying = false;
            this.isPaused = true;
            this.expectTrackFinish = false;
            this.updatePlayPauseIcons();
            print("Music paused.");
        } catch (error) {
            print(`Error pausing music: ${error}`);
        }
    }

    private resumeMusic(): void {
        if (!this.audioComponent || !this.audioInitialized) return;
        
        try {
            if (this.isPaused) {
                this.audioComponent.resume();
            } else {
                this.audioComponent.play(this.volume);
            }
            this.isPlaying = true;
            this.isPaused = false;
            this.expectTrackFinish = true;
            this.updatePlayPauseIcons();
            print("Music resumed.");
        } catch (error) {
            print(`Error resuming music: ${error}`);
        }
    }

    private stopMusic(): void {
        if (!this.audioComponent) return;
        
        try {
            this.isManualStop = true;
            this.expectTrackFinish = false;
            
            if (this.audioInitialized) {
                this.audioComponent.stop(false);
            }
            this.isPlaying = false;
            this.isPaused = false;
            this.currentTrackIndex = -1;
            this.audioInitialized = false;
            this.updatePlayPauseIcons();
            this.updateTrackInfoUI();
            print("Music stopped.");
        } catch (error) {
            print(`Error stopping music: ${error}`);
        }
    }

    private handleAutoAdvance(): void {
        if (!this.allTracksData || this.allTracksData.length === 0) return;
        
        let nextIndex = this.currentTrackIndex + 1;
        if (nextIndex >= this.allTracksData.length) {
            if (this.loopPlayback) {
                nextIndex = 0;
            } else {
                print("All tracks finished, stopping playback.");
                this.stopMusic();
                return;
            }
        }
        this.loadTrack(nextIndex, true);
    }

    public playNextTrack(): void {
        if (!this.allTracksData || this.allTracksData.length === 0) {
            print("No tracks available");
            return;
        }

        if (this.isLoadingRemote) {
            print("Next track ignored: Loading remote track.");
            return;
        }

        let nextIndex = this.currentTrackIndex + 1;
        if (nextIndex >= this.allTracksData.length) {
            nextIndex = this.loopPlayback ? 0 : this.allTracksData.length - 1;
        }

        if (nextIndex >= 0 && nextIndex < this.allTracksData.length) {
            this.loadTrack(nextIndex, true);
        }
    }

    public playPrevTrack(): void {
        if (!this.allTracksData || this.allTracksData.length === 0) {
            print("No tracks available");
            return;
        }

        if (this.isLoadingRemote) {
            print("Previous track ignored: Loading remote track.");
            return;
        }

        let prevIndex = this.currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.loopPlayback ? this.allTracksData.length - 1 : 0;
        }

        if (prevIndex >= 0 && prevIndex < this.allTracksData.length) {
            this.loadTrack(prevIndex, true);
        }
    }

    // --- UI & Icon Management ---
    private updatePlayPauseIcons(): void {
        try {
            if (this.playIcon && this.pauseIcon) {
                this.pauseIcon.enabled = this.isPlaying;
                this.playIcon.enabled = !this.isPlaying;
            }
        } catch (error) {
            print(`Error updating play/pause icons: ${error}`);
        }
    }

    private updateTrackInfoUI(): void {
        try {
            let title = "---";
            let artist = "---";
            
            if (this.isLoadingRemote && this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
                const trackData = this.allTracksData[this.currentTrackIndex];
                title = trackData?.title || "Loading...";
                artist = trackData?.artist || "";
            } else if (this.currentTrackIndex !== -1 && this.currentTrackIndex < this.allTracksData.length) {
                const trackData = this.allTracksData[this.currentTrackIndex];
                if (trackData) {
                    title = trackData.title;
                    artist = trackData.artist;
                } else {
                    title = "Error";
                    artist = "Invalid Track";
                }
            } else if (this.currentTrackIndex !== -1) {
                title = "Error";
                artist = "Invalid Index";
            }

            if (this.trackTitleText) {
                this.trackTitleText.text = title;
            }
            if (this.artistNameText) {
                this.artistNameText.text = artist;
            }
        } catch (error) {
            print(`Error updating track info UI: ${error}`);
        }
    }

    // --- Cleanup ---
    onDestroy(): void {
        print("Destroying SimpleMusicPlayerManager.");
        
        this.expectTrackFinish = false;
        this.pendingDelayedCalls = [];
        
        if (this.audioComponent) {
            try {
                this.audioComponent.setOnFinish(null);
            } catch (e) {}
            
            if (this.isPlaying || this.isPaused) {
                try {
                    this.audioComponent.stop(false);
                } catch (e) {}
            }
            
            try {
                this.audioComponent.audioTrack = null;
            } catch (e) {}
        }
        
        // Nettoyer les callbacks
        try {
            if (this.playPauseButton && this.onPlayPauseCallback) {
                this.playPauseButton.onButtonPinched.remove(this.onPlayPauseCallback);
            }
            if (this.nextTrackButton && this.onNextTrackCallback) {
                this.nextTrackButton.onButtonPinched.remove(this.onNextTrackCallback);
            }
            if (this.prevTrackButton && this.onPrevTrackCallback) {
                this.prevTrackButton.onButtonPinched.remove(this.onPrevTrackCallback);
            }
        } catch (error) {
            print(`Error during cleanup: ${error}`);
        }
    }
}