'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Image, Play, Loader2, AlertCircle, CheckCircle, Download, Home, Link as LinkIcon, BarChart3, Activity, Video, LogOut, FileVideo, FileDown } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface WatermarkOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  margin: number;
  fps: number;
  videoBitrate: number;
  audioBitrate: number;
  volume: number;
  rotation: number;
  width: number;
  height: number;
  speed: number;
  zoom: number;
  noise: number;
  waveformShift: number;
  addRandomMetadata: boolean;
  browserWatermarkUrl: string;
  browserWatermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  browserWatermarkOpacity: number;
  browserWatermarkMargin: number;
  browserWatermarkSize: number;
  // Enable/disable settings
  enablePosition: boolean;
  enableOpacity: boolean;
  enableMargin: boolean;
  enableFps: boolean;
  enableVideoBitrate: boolean;
  enableAudioBitrate: boolean;
  enableVolume: boolean;
  enableRotation: boolean;
  enableDimensions: boolean;
  enableSpeed: boolean;

  enableNoise: boolean;
  enableWaveformShift: boolean;
  enableBrowserWatermark: boolean;
}
export default function WatermarkUrlPage() {
  const { signOut, user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [browserWatermarkFile, setBrowserWatermarkFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    position: 'bottom-right',
    opacity: 0.7,
    margin: 20,
    fps: 30,
    videoBitrate: 1000,
    audioBitrate: 128,
    volume: 1.0,
    rotation: 0,
    width: 1280,
    height: 720,
    speed: 1.0,
    zoom: 1.0,
    noise: 0,
    waveformShift: 1.0,
    addRandomMetadata: false,
    browserWatermarkUrl: '',
    browserWatermarkPosition: 'bottom-right',
    browserWatermarkOpacity: 0.8,
    browserWatermarkMargin: 15,
    browserWatermarkSize: 100,
    // Enable/disable settings - default to disabled for fastest processing
    enablePosition: false,
    enableOpacity: false,
    enableMargin: false,
    enableFps: false,
    enableVideoBitrate: false,
    enableAudioBitrate: false,
    enableVolume: false,
    enableRotation: false,
    enableDimensions: false,
    enableSpeed: false,

    enableNoise: false,
    enableWaveformShift: false,
    enableBrowserWatermark: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>('');
  const [ffmpegCommand, setFfmpegCommand] = useState<string>('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [selectedVideoName, setSelectedVideoName] = useState('');
  const [selectedWatermarkName, setSelectedWatermarkName] = useState('');
  // Output directory and copies
  const [outputDirHandle, setOutputDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [outputDirName, setOutputDirName] = useState<string>('');
  const [copyCount, setCopyCount] = useState<number>(1);
  // Removed output location selection per request

  // UploadThing hooks
  const { startUpload: startVideoUpload, isUploading: isVideoUploadingThing } = useUploadThing("videoUploader", {
    onClientUploadComplete: (res) => {
      setIsVideoUploading(false);
      if (res && res[0]) {
        setVideoUrl(res[0].url);
        setSelectedVideoName(res[0].name);
        console.log('Video uploaded successfully:', res[0].url);
      }
    },
    onUploadError: (error: Error) => {
      setIsVideoUploading(false);
      setError(`Video upload failed: ${error.message}`);
      console.error('Upload error:', error);
    },
  });

  const { startUpload: startWatermarkUpload, isUploading: isWatermarkUploadingThing } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setWatermarkUrl(res[0].url);
        setWatermarkFile(null); // Clear file since we're using URL now
        setSelectedWatermarkName(res[0].name);
        console.log('Watermark uploaded successfully:', res[0].url);
      }
    },
    onUploadError: (error: Error) => {
      setError(`Watermark upoad failed: ${error.message}`);
      console.error('Upload error:', error);
    },
  });

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile } = await import('@ffmpeg/util');

        const ffmpegInstance = new FFmpeg();

        ffmpegInstance.on('log', ({ message }: { message: string }) => {
          console.log(message);
          // Update progress based on frame processing - optimized for speed
          if (message.includes('frame=')) {
            const frameMatch = message.match(/frame=\s*(\d+)/);
            if (frameMatch) {
              const frame = parseInt(frameMatch[1]);
              // Assuming 15 fps, 5 seconds = 75 frames
              const progress = Math.min(85, 40 + (frame / 75) * 45);
              setProgress(Math.floor(progress));
            }
          }
        });

        await ffmpegInstance.load();
        setFfmpeg(ffmpegInstance);
        setIsFfmpegLoaded(true);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        setError('Failed to load FFmpeg. Please check your internet connection and try again.');
      }
    };

    loadFFmpeg();
  }, []);

  // Update FFmpeg command in real-time when options change
  useEffect(() => {
    buildFfmpegCommand();
  }, [watermarkOptions, videoUrl, watermarkUrl, watermarkFile, browserWatermarkFile]);

  const generateRandomUSMetadata = () => {
    const usCities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
      'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
      'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
      'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville',
      'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville',
      'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento'
    ];

    const usStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
      'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
      'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
      'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
      'WI', 'WY'
    ];

    const randomCity = usCities[Math.floor(Math.random() * usCities.length)];
    const randomState = usStates[Math.floor(Math.random() * usStates.length)];
    const randomYear = Math.floor(Math.random() * 10) + 2015;
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const randomDay = Math.floor(Math.random() * 28) + 1;

    return {
      location: `${randomCity}, ${randomState}`,
      date: `${randomYear}-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`,
      creator: `Video Creator ${Math.floor(Math.random() * 1000)}`,
      copyright: `© ${randomYear} ${randomCity} Media`,
      description: `Video recorded in ${randomCity}, ${randomState}`
    };
  };

  // Save output copies using File System Access API when possible
  const saveOutputCopies = async (blob: Blob) => {
    const maxCopies = 100;
    const copies = Math.min(Math.max(1, Number(copyCount || 1)), maxCopies);

    // If no directory chosen or API not available, fall back to single download via anchor
    const canPickDir = typeof (window as any).showDirectoryPicker === 'function';
    // Request persistent storage to improve write reliability
    try { await (navigator as any).storage?.persist?.(); } catch {}
    if (!outputDirHandle || !canPickDir) {
      // Trigger one download; multiple automatic downloads are blocked by browsers
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = selectedVideoName ? selectedVideoName.replace(/\.[^.]+$/, '') + '-output.mp4' : 'output.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return;
    }

    // Verify permission
    const verifyPermission = async (dirHandle: FileSystemDirectoryHandle) => {
      const opts: any = { mode: 'readwrite' };
      // @ts-ignore
      const q = await dirHandle.queryPermission?.(opts);
      if (q === 'granted') return true;
      // @ts-ignore
      const r = await dirHandle.requestPermission?.(opts);
      return r === 'granted';
    };

    const hasPerm = await verifyPermission(outputDirHandle);
    if (!hasPerm) throw new Error('Permission to write to the selected folder was denied.');

    const baseName = (selectedVideoName || 'output').replace(/\.[^.]+$/, '');
    const buffer = await blob.arrayBuffer();
    for (let i = 1; i <= copies; i++) {
      const fileName = `${baseName}-copy-${i}.mp4`;
      const fileHandle = await outputDirHandle.getFileHandle(fileName, { create: true } as any);
      const writable = await (fileHandle as any).createWritable({ keepExistingData: false });
      await writable.write(buffer);
      await writable.close();
      // Yield to the event loop to keep UI responsive on many copies
      await new Promise((res) => setTimeout(res, 0));
    }
  };

  const handleOptionChange = (field: keyof WatermarkOptions, value: any) => {
    setWatermarkOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleWatermarkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setWatermarkFile(file);
      setWatermarkUrl(''); // Clear URL when file is selected
    }
  };



  const handleBrowserWatermarkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBrowserWatermarkFile(file);
      handleOptionChange('browserWatermarkUrl', ''); // Clear URL when file is selected
    }
  };

  // Parse command arguments properly, handling quoted strings
  const parseCommandArgs = (command: string): string[] => {
    const args: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < command.length; i++) {
      const char = command[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      }
      
      if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
      
      if (char === ' ' && !inQuotes) {
        if (current.trim()) {
          args.push(current.trim());
        }
        current = '';
        continue;
      }
      
      current += char;
    }
    
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args.filter(arg => arg.length > 0);
  };

  const buildFfmpegCommand = () => {
    // Generate command even without files for preview purposes
    if (!videoUrl && !watermarkUrl && !watermarkFile) return '';

    // Build position based on enabled settings
    let position = '';
    if (watermarkOptions.enablePosition && watermarkOptions.enableMargin) {
      switch (watermarkOptions.position) {
        case 'top-left':
          position = `${watermarkOptions.margin}:${watermarkOptions.margin}`;
          break;
        case 'top-right':
          position = `W-w-${watermarkOptions.margin}:${watermarkOptions.margin}`;
          break;
        case 'bottom-left':
          position = `${watermarkOptions.margin}:H-h-${watermarkOptions.margin}`;
          break;
        case 'bottom-right':
          position = `W-w-${watermarkOptions.margin}:H-h-${watermarkOptions.margin}`;
          break;
        case 'center':
          position = `(W-w)/2:(H-h)/2`;
          break;
      }
    } else {
      position = 'W-w-20:H-h-20'; // Default position
    }

    // Browser watermark position calculation
    let browserPosition = '';
    if ((watermarkOptions.browserWatermarkUrl || browserWatermarkFile) && watermarkOptions.enableBrowserWatermark) {
      switch (watermarkOptions.browserWatermarkPosition) {
        case 'top-left':
          browserPosition = `${watermarkOptions.browserWatermarkMargin}:${watermarkOptions.browserWatermarkMargin}`;
          break;
        case 'top-right':
          browserPosition = `W-w-${watermarkOptions.browserWatermarkMargin}:${watermarkOptions.browserWatermarkMargin}`;
          break;
        case 'bottom-left':
          browserPosition = `${watermarkOptions.browserWatermarkMargin}:H-h-${watermarkOptions.browserWatermarkMargin}`;
          break;
        case 'bottom-right':
          browserPosition = `W-w-${watermarkOptions.browserWatermarkMargin}:H-h-${watermarkOptions.browserWatermarkMargin}`;
          break;
        case 'center':
          browserPosition = `(W-w)/2:(H-h)/2`;
          break;
      }
    }

    // Watermark opacity
    const opacity = watermarkOptions.enableOpacity ? watermarkOptions.opacity : 0.7;

    // Build output arguments from enabled options only
    let outputArgs = '';
    if (watermarkOptions.enableFps) {
      outputArgs += ` -r ${watermarkOptions.fps}`;
    }
    if (watermarkOptions.enableVideoBitrate) {
      outputArgs += ` -b:v ${watermarkOptions.videoBitrate}k`;
    }
    if (watermarkOptions.enableAudioBitrate) {
      outputArgs += ` -b:a ${watermarkOptions.audioBitrate}k`;
    }

    // Build command to exactly match requested shape
    const needsReencode = (
      watermarkOptions.enableFps ||
      watermarkOptions.enableVideoBitrate ||
      watermarkOptions.enableAudioBitrate ||
      (watermarkOptions.enableVolume && typeof watermarkOptions.volume === 'number') ||
      watermarkOptions.addRandomMetadata
    );

    let command = `-i input.mp4`;
    if (!needsReencode) {
      // Fast path: stream copy (no re-encode)
      command += ` -c:v copy -c:a copy -movflags +faststart output.mp4`;
    } else {
      // Re-encode with ultrafast preset for speed
      command += ` -preset ultrafast -tune fastdecode -movflags +faststart`;
      if (watermarkOptions.enableFps) command += ` -r ${watermarkOptions.fps}`;
      if (watermarkOptions.enableVideoBitrate) command += ` -b:v ${watermarkOptions.videoBitrate}k`;
      if (watermarkOptions.enableAudioBitrate) command += ` -b:a ${watermarkOptions.audioBitrate}k`;
      if (watermarkOptions.enableVolume && typeof watermarkOptions.volume === 'number') {
        command += ` -filter:a "volume=${watermarkOptions.volume}"`;
      }
      // Add metadata if enabled
      if (watermarkOptions.addRandomMetadata) {
        const metadata = generateRandomUSMetadata();
        command += ` -metadata title=\"Video from ${metadata.location}\" -metadata artist=\"${metadata.creator}\" -metadata date=\"${metadata.date}\" -metadata copyright=\"${metadata.copyright}\" -metadata description=\"${metadata.description}\" -metadata location=\"${metadata.location}\"`;
      }
      command += ` output.mp4`;
    }
    
    // Add metadata if enabled
    if (watermarkOptions.addRandomMetadata) {
      const metadata = generateRandomUSMetadata();
      const metadataArgs = ` -metadata title="Video from ${metadata.location}" -metadata artist="${metadata.creator}" -metadata date="${metadata.date}" -metadata copyright="${metadata.copyright}" -metadata description="${metadata.description}" -metadata location="${metadata.location}"`;
      // Insert metadata before the output filename
      const lastSpaceIndex = command.lastIndexOf(' ');
      if (lastSpaceIndex !== -1) {
        command = command.substring(0, lastSpaceIndex) + metadataArgs + ' ' + command.substring(lastSpaceIndex + 1);
      } else {
        command += metadataArgs;
      }
    }

    setFfmpegCommand(command);
    console.log('🔧 Generated FFmpeg Command:', command);
    return command;
  };

  const processWatermark = async () => {
    if (!ffmpeg || !isFfmpegLoaded) {
      setError('FFmpeg is not loaded yet. Please wait and try again.');
      return;
    }

    if (!videoUrl) {
      setError('Please provide a video URL.');
      return;
    }

    // Try to get output directory immediately (within user gesture) if not selected
    try {
      const picker = (window as any).showDirectoryPicker;
      if (!outputDirHandle && typeof picker === 'function') {
        const handle: FileSystemDirectoryHandle = await picker();
        setOutputDirHandle(handle);
        setOutputDirName((handle as any).name || 'Selected folder');
      }
    } catch (_e) {
      // Silent: fall back to single download later if no folder
    }

    // Test FFmpeg functionality first
    try {
      console.log('Testing FFmpeg functionality...');
      const testResult = await ffmpeg.exec(['-version']);
      console.log('FFmpeg test successful');
    } catch (testError) {
      console.error('FFmpeg test failed:', testError);
      setError('FFmpeg is not working properly. Please refresh the page and try again.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');

    try {
      const includeWatermark = false; // watermark fully removed
      const { fetchFile } = await import('@ffmpeg/util');

      // Download video from URL with CORS handling
      setProgress(15);
      console.log('Downloading video from:', videoUrl);
      const videoResponse = await fetch(videoUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'video/*,image/*,*/*'
        }
      });
      if (!videoResponse.ok) throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
      const videoBlob = await videoResponse.blob();
      console.log('Video blob size:', videoBlob.size);
      
      // Check if video blob is valid
      if (videoBlob.size === 0) {
        throw new Error('Downloaded video file is empty');
      }
      
      const videoFile = new File([videoBlob], 'input.mp4', { type: 'video/mp4' });

      // Watermark processing removed

      // Browser watermark removed

      // Write files to FFmpeg virtual filesystem
      setProgress(35);
      console.log('Writing video file to FFmpeg...');
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      setProgress(45);
      // No watermark file writes

      // Write browser watermark file if available
      // No browser watermark writes

      // DEBUG: List files before running FFmpeg
      console.log('=== DEBUG: Files before FFmpeg execution ===');
      const filesBefore = await ffmpeg.listDir('.');
      console.log('Files in FFmpeg filesystem before execution:', filesBefore.map((f: any) => f.name));
      
      // Verify required files exist
      const requiredFiles = ['input.mp4'];
      
      for (const file of requiredFiles) {
        const fileExists = filesBefore.some((f: any) => f.name === file);
        if (!fileExists) {
          throw new Error(`Required file ${file} not found in FFmpeg filesystem`);
        }
        console.log(`✓ ${file} exists in FFmpeg filesystem`);
      }

      // Build and run FFmpeg command
      setProgress(55);
      const command = buildFfmpegCommand();
      if (!command) throw new Error('Failed to build FFmpeg command');

      console.log('FFmpeg command:', command);
      console.log('Command length:', command.length);
      
      // Validate command has required elements (no watermark needed)
      if (!command.includes('input.mp4') || !command.includes('output.mp4')) {
        throw new Error('Invalid FFmpeg command - missing required input/output files');
      }
      
      setProgress(60);
      console.log('Executing FFmpeg...');
      
      // Add verbose logging for FFmpeg
      ffmpeg.on('log', ({ type, message }: { type: string; message: string }) => {
        console.log(`[FFmpeg ${type}] ${message}`);
        // Update progress based on frame processing - optimized for speed
        if (message.includes('frame=')) {
          const frameMatch = message.match(/frame=\s*(\d+)/);
          if (frameMatch) {
            const frame = parseInt(frameMatch[1]);
            // Assuming 15 fps, 5 seconds = 75 frames
            const progress = Math.min(85, 60 + (frame / 75) * 25);
            setProgress(Math.floor(progress));
          }
        }
      });
      
      try {
        // Parse command arguments properly, handling quoted strings
        const args = parseCommandArgs(command);
        console.log('Parsed FFmpeg args:', args);
        
        const execResult = await ffmpeg.exec(args);
        console.log('FFmpeg execution completed successfully');
        setProgress(85);
      } catch (execError) {
        console.error('FFmpeg execution error:', execError);
        
        // Try with a simplified command as fallback (prefer stream copy)
        console.log('Trying simplified FFmpeg command...');
        const simpleCommand = `-i input.mp4 -c:v copy -c:a copy -movflags +faststart output.mp4`;
        
        const simpleArgs = parseCommandArgs(simpleCommand);
        console.log('Trying simplified command:', simpleCommand);
        console.log('Simplified args:', simpleArgs);
        
        try {
          await ffmpeg.exec(simpleArgs);
          console.log('Simplified FFmpeg command executed successfully');
          setProgress(85);
        } catch (simpleExecError) {
          console.error('Simplified FFmpeg command also failed:', simpleExecError);
          
          // Try the most basic command possible (still stream copy)
          console.log('Trying ultra-simple FFmpeg command...');
          const ultraSimpleCommand = `-i input.mp4 -c copy -movflags +faststart output.mp4`;
          const ultraSimpleArgs = parseCommandArgs(ultraSimpleCommand);
          console.log('Ultra-simple command:', ultraSimpleCommand);
          
          try {
            await ffmpeg.exec(ultraSimpleArgs);
            console.log('Ultra-simple FFmpeg command executed successfully');
            setProgress(85);
          } catch (ultraSimpleError) {
            console.error('Ultra-simple FFmpeg command also failed:', ultraSimpleError);
            
            // Try absolute simplest: raw copy
            console.log('Trying absolute simplest command - raw stream copy...');
            const copyCommand = `-i input.mp4 -c copy -movflags +faststart output.mp4`;
            const copyArgs = parseCommandArgs(copyCommand);
            console.log('Copy command:', copyCommand);
            
            await ffmpeg.exec(copyArgs);
            console.log('Copy command executed successfully');
            setProgress(85);
          }
        }
      }

      // Read the output file
      console.log('Reading output file...');
      try {
        const data = await ffmpeg.readFile('output.mp4');
        console.log('Output file size:', data.length);
        
        if (!data || data.length === 0) {
          throw new Error('Output file is empty');
        }
        
        setProgress(92);

        // Create blob URL and store blob for later download/copy
        const blob = new Blob([data], { type: 'video/mp4' });
        setOutputBlob(blob);
        const url = URL.createObjectURL(blob);

        setProgress(100);
        setOutputUrl(url);
      } catch (readError) {
        console.error('Failed to read output file:', readError);
        
        // List files in FFmpeg filesystem for debugging
        try {
          const files = await ffmpeg.listDir('.');
          console.log('Files in FFmpeg filesystem after execution:', files);
          
          // Try to read any available files to see what was created
          for (const file of files) {
            if (file.isFile && file.name.endsWith('.mp4')) {
              try {
                const fileData = await ffmpeg.readFile(file.name);
                console.log(`Found ${file.name} with size:`, fileData.length);
                
                // If we found a valid output file, use it
                if (fileData && fileData.length > 0) {
                  console.log(`Using ${file.name} as output file`);
                  const blob = new Blob([fileData], { type: 'video/mp4' });
                  try { await saveOutputCopies(blob); } catch (e) { console.warn('Saving copies failed or skipped:', e); }
                  const url = URL.createObjectURL(blob);
                  setProgress(100);
                  setOutputUrl(url);
                  return; // Success!
                }
              } catch (e) {
                console.log(`Could not read ${file.name}:`, e);
              }
            }
          }
          
          // Check for other video files that might have been created
          for (const file of files) {
            if (file.isFile && (file.name.includes('output') || file.name.includes('out'))) {
              try {
                const fileData = await ffmpeg.readFile(file.name);
                console.log(`Found potential output file ${file.name} with size:`, fileData.length);
                
                if (fileData && fileData.length > 0) {
                  console.log(`Using ${file.name} as output file`);
                  const blob = new Blob([fileData], { type: 'video/mp4' });
                  try { await saveOutputCopies(blob); } catch (e) { console.warn('Saving copies failed or skipped:', e); }
                  const url = URL.createObjectURL(blob);
                  setProgress(100);
                  setOutputUrl(url);
                  return; // Success!
                }
              } catch (e) {
                console.log(`Could not read ${file.name}:`, e);
              }
            }
          }
        } catch (listError) {
          console.error('Failed to list files:', listError);
        }
        
        // Provide more specific error information
        let errorMessage = `FFmpeg processing failed - no output file generated.`;
        if (readError instanceof Error) {
          errorMessage += ` Error: ${readError.message}`;
        } else {
          errorMessage += ` Error: ${readError}`;
        }
        
        // Add debugging info
        errorMessage += `\n\nDebug Info:`;
        errorMessage += `\n- Command: ${command}`;
        
        // Get files list for debugging
        try {
          const debugFiles = await ffmpeg.listDir('.');
          errorMessage += `\n- Files in filesystem: ${debugFiles.map((f: any) => f.name).join(', ')}`;
        } catch (listError) {
          errorMessage += `\n- Could not list files: ${listError}`;
        }
        
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('FFmpeg error:', error);
      setError(`Failed to process watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(ffmpegCommand);
  };

  const downloadVideo = async () => {
    if (!outputBlob && outputUrl) {
      // Fallback: fetch the blob from URL
      try {
        const resp = await fetch(outputUrl);
        const b = await resp.blob();
        setOutputBlob(b);
      } catch {}
    }

    if (outputBlob) {
      try {
        await saveOutputCopies(outputBlob);
        return;
      } catch (e) {
        console.warn('Saving to folder failed; falling back to browser download', e);
      }
    }

    if (outputUrl) {
      const a = document.createElement('a');
      a.href = outputUrl;
      a.download = selectedVideoName ? selectedVideoName.replace(/\.[^.]+$/, '') + '-output.mp4' : 'output.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen bg-white">
          {/* Sidebar */}
          <Sidebar>
            <SidebarHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3 px-4">
                <div className="w-8 h-8 bg-[#B19272] rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
          </div>
                <div>
                  <h2 className="font-semibold text-gray-900">ViewIt</h2>
                  <p className="text-xs text-gray-500">Repurpose Bot</p>
        </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/">
                          <Home className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>
                        <Video className="w-4 h-4" />
                        <span>Repurpose Bot</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/converter">
                          <Video className="w-4 h-4" />
                          <span>Converter</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/deep-links">
                          <LinkIcon className="w-4 h-4" />
                          <span>Deep Links</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/analytics">
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/profile">
                          <Activity className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 pt-4">
              <div className="px-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
        </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">Admin</p>
      </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-gray-300 text-red-600 hover:text-red-700"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>

      {/* Main Content */}
          <SidebarInset>
            <div className="flex flex-col h-full w-full">
              {/* Header */}
              <div className="relative flex items-center justify-center p-6 border-b border-gray-200">
                <SidebarTrigger className="absolute left-6" />
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900">Repurpose Bot</h1>
                  <p className="text-gray-600">Watermark and process your media</p>
                </div>
              </div>

              <div className="flex-1 p-6 flex justify-center">
                <div className="w-full max-w-6xl">
                  {/* Original content starts here */}
                  <div className="w-full max-w-6xl mx-auto p-0">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#F8F5F2', borderColor: '#E7DFD7' }}>
              <div className="flex items-center gap-2" style={{ color: '#B19272' }}>
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* File Selection Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 gap-6">
                            {/* Video File Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Video File:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={selectedVideoName || ''}
                    placeholder="No video selected"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] placeholder-gray-400"
                  />
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'video/mp4,video/quicktime,video/x-matroska,.mp4,.mov,.mkv';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Client-side validation
                          const allowedTypes = new Set(['video/mp4', 'video/quicktime', 'video/x-matroska']);
                          const maxBytes = 1024 * 1024 * 1024; // 1GB
                          const lowerName = file.name.toLowerCase();
                          const extensionAllowed = lowerName.endsWith('.mp4') || lowerName.endsWith('.mov') || lowerName.endsWith('.mkv');
                          if (!allowedTypes.has(file.type) && !extensionAllowed) {
                            setError('Only MP4, MOV, and MKV files are allowed.');
                            return;
                          }
                          if (file.size > maxBytes) {
                            setError('File is too large. Maximum allowed size is 1 GB.');
                            return;
                          }
                          setSelectedVideoName(file.name);
                          setIsVideoUploading(true);
                          setError('');
                          try {
                            await startVideoUpload([file]);
                          } catch (error) {
                            console.error('Video upload error:', error);
                            setError(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            setIsVideoUploading(false);
                          }
                        }
                      };
                      input.click();
                    }}
                    disabled={isVideoUploadingThing}
                    className="flex items-center gap-2 bg-[#B19272] hover:bg-[#9A7B5F] text-white px-6 py-3 rounded transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVideoUploadingThing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileVideo className="w-4 h-4" />
                        Browse
                      </>
                    )}
                  </button>
                </div>
                {isVideoUploading && (
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Uploading video file...
                  </p>
                )}
              </div>

              {/* Output Directory and Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Folder (for saving processed copies):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={outputDirName}
                    readOnly
                    placeholder="No folder selected"
                    className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] placeholder-gray-400"
                  />
                  <button
                    onClick={async () => {
                      try {
                        // File System Access API (Chromium-based browsers)
                        const picker = (window as any).showDirectoryPicker;
                        if (typeof picker !== 'function') {
                          setError('Folder selection is not supported in this browser. Use a Chromium-based browser (Chrome/Edge).');
                          return;
                        }
                        const handle: FileSystemDirectoryHandle = await picker();
                        setOutputDirHandle(handle);
                        setOutputDirName((handle as any).name || 'Selected folder');
                        setError('');
                      } catch (e) {
                        if ((e as any)?.name !== 'AbortError') {
                          setError('Failed to select folder.');
                        }
                      }
                    }}
                    className="flex items-center gap-2 bg-[#B19272] hover:bg-[#9A7B5F] text-white px-6 py-3 rounded transition-colors shadow-sm"
                  >
                    Choose Folder
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of copies (max 100):
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={copyCount}
                  onChange={(e) => setCopyCount(Math.min(100, Math.max(1, Number(e.target.value || 1))))}
                  className="w-44 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] placeholder-gray-400"
                />
              </div>

              {/* Output Location Selection removed per request */}



            </div>
          </div>

          {/* Settings Grid */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 mb-6">
              <Image className="w-6 h-6 text-[#B19272]" />
              Video & Watermark Settings
            </h2>

            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              {/* FPS */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 transition-all duration-300">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={watermarkOptions.enableFps}
                    onChange={(e) => handleOptionChange('enableFps', e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded bg-white transition-all duration-300"
                    style={{ accentColor: '#B19272', color: '#B19272' }}
                  />
                  <span className="text-gray-800">Framerate</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={watermarkOptions.fps}
                  onChange={(e) => handleOptionChange('fps', parseInt(e.target.value))}
                  disabled={!watermarkOptions.enableFps}
                  className={`w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] transition-all duration-300 ${!watermarkOptions.enableFps ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="30"
                />
                <span className="text-xs text-gray-500">FPS</span>
              </div>

              {/* Video Bitrate */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={watermarkOptions.enableVideoBitrate}
                    onChange={(e) => handleOptionChange('enableVideoBitrate', e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded bg-white"
                    style={{ accentColor: '#B19272', color: '#B19272' }}
                  />
                  Video Bitrate
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  value={watermarkOptions.videoBitrate}
                  onChange={(e) => handleOptionChange('videoBitrate', parseInt(e.target.value))}
                  disabled={!watermarkOptions.enableVideoBitrate}
                  className={`w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] ${!watermarkOptions.enableVideoBitrate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="1000"
                />
              </div>

              {/* Audio Bitrate */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={watermarkOptions.enableAudioBitrate}
                    onChange={(e) => handleOptionChange('enableAudioBitrate', e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded bg-white"
                    style={{ accentColor: '#B19272', color: '#B19272' }}
                  />
                  Audio Bitrate
                </label>
                <input
                  type="number"
                  min="32"
                  max="320"
                  value={watermarkOptions.audioBitrate}
                  onChange={(e) => handleOptionChange('audioBitrate', parseInt(e.target.value))}
                  disabled={!watermarkOptions.enableAudioBitrate}
                  className={`w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] ${!watermarkOptions.enableAudioBitrate ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="128"
                />
              </div>

              {/* Volume */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={watermarkOptions.enableVolume}
                    onChange={(e) => handleOptionChange('enableVolume', e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded bg-white"
                    style={{ accentColor: '#B19272', color: '#B19272' }}
                  />
                  Volume
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={watermarkOptions.volume}
                  onChange={(e) => handleOptionChange('volume', parseFloat(e.target.value))}
                  disabled={!watermarkOptions.enableVolume}
                  className={`w-full px-2 py-1 border border-gray-300 bg-white text-gray-900 rounded text-sm focus:ring-2 focus:ring-[#B19272] focus:border-[#B19272] ${!watermarkOptions.enableVolume ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="1.0"
                />
              </div>

              {/* US Metadata */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={watermarkOptions.addRandomMetadata}
                    onChange={(e) => handleOptionChange('addRandomMetadata', e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded bg-white"
                    style={{ accentColor: '#B19272' }}
                  />
                  US Metadata
                </label>
                <p className="text-xs text-gray-500">Random US Metadata</p>
              </div>
            </div>

            {/* Row 2 removed per request (watermark upload, position, opacity, margin, speed) */}

            {/* Row 3 removed per request (Noise, Waveform Shift) */}
                  </div>



          {/* Submit Button */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4">
              {/* Generate Button */}
              <button
                onClick={processWatermark}
                disabled={isProcessing || !isFfmpegLoaded || !videoUrl}
                className={`flex items-center gap-2 px-8 py-2 text-lg font-semibold rounded-lg transition-colors duration-200 shadow-sm ${
                  isProcessing || !isFfmpegLoaded || !videoUrl
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#B19272] text-white hover:bg-[#9A7B5F]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing... {progress}%
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
            
            {/* FFmpeg Command Preview removed per request */}
            
            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#B19272] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Processing video... {progress}% complete</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-6 mt-8">



            {/* Video Preview */}
            {outputUrl && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Watermarked Video</h3>
                <div className="space-y-4">
                  <div className="w-full flex justify-center">
                    <video
                      className="w-full max-w-md rounded-lg shadow-sm border border-gray-200"
                      controls
                      src={outputUrl}
                    />
                  </div>
                  <button
                    onClick={downloadVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-[#B19272] text-white rounded-lg hover:bg-[#9A7B5F] transition-colors duration-200 shadow-sm mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download Video
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="mt-6 text-center">
            {!isFfmpegLoaded && (
              <div className="flex items-center justify-center gap-2 text-orange-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading FFmpeg...</span>
              </div>
            )}
            {isFfmpegLoaded && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">FFmpeg Ready</span>
              </div>
            )}
          </div>
        </div>
                  {/* Original content ends here */}
      </div>
    </div>
          </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}