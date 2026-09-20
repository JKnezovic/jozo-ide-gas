package com.eondevelopers.jozoidegas;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AmazonS3Service {

    private static final Logger log = LoggerFactory.getLogger(AmazonS3Service.class);

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${amazon.s3.bucketName}")
    private String bucketName;

    public String uploadFile(MultipartFile file,String folderName) {
        try {
            String objectKey = folderName + "/" + uniqueFileName(file.getOriginalFilename());

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());
            amazonS3.putObject(bucketName, objectKey, file.getInputStream(), metadata);
            return amazonS3.getUrl(bucketName, objectKey).toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Phone filenames repeat constantly - every trip has an IMG_0042.jpg - so using the name
     * as-is let one ride overwrite another ride's photo, and deleting either one then took
     * the survivor's image with it. The random prefix keeps every upload distinct, and the
     * sanitising keeps the key free of characters that would be escaped in the returned URL
     * (which is what delete later parses the key back out of).
     */
    private String uniqueFileName(String originalName) {
        String cleaned = originalName == null ? "" : originalName.replaceAll("[^A-Za-z0-9._-]", "_");
        return UUID.randomUUID() + (cleaned.isEmpty() ? "" : "-" + cleaned);
    }

    public void deleteImageFromS3(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("Images")) {
            log.warn("Skipping S3 delete for unusable url: {}", imageUrl);
            return;
        }
        try {
            String key = imageUrl.substring(imageUrl.indexOf("Images"));
            amazonS3.deleteObject(new DeleteObjectRequest(bucketName, key));
            System.out.println("Deleted image from S3: " + key);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

