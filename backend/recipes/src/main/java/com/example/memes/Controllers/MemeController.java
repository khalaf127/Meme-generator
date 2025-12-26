package com.example.memes.Controllers;

import com.example.memes.Services.MemeService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/memes")
public class MemeController {

    private final MemeService memeService;

    public MemeController(MemeService memeService) {
        this.memeService = memeService;
    }

    /**
     * Upload a meme to S3
     */
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String key = memeService.upload(file);
            return ResponseEntity.ok(key);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }

    /**
     * Download a meme from S3 (streaming)
     */
    @GetMapping("/download")
    public ResponseEntity<?> download(@RequestParam String key) {

        try {
            var s3Object = memeService.download(key);

            String filename = key.substring(key.lastIndexOf("/") + 1);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new InputStreamResource(s3Object));

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
