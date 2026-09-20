package com.eondevelopers.jozoidegas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Image {

    public static final String TYPE_IMAGE = "image";
    public static final String TYPE_VIDEO = "video";

    private String src;
    /** Low quality placeholder. Null for videos, which have no generated poster frame. */
    private String LQIPsrc;
    private String desc;
    /** TYPE_IMAGE or TYPE_VIDEO. Null on rides saved before video support - treat as image. */
    private String type;
}
