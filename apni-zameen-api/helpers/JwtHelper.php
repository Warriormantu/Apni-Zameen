<?php

class JwtHelper {
    private static $secret_key = 'your-secret-key-here'; // Change this to a secure key
    private static $algorithm = 'HS256';

    public static function generateToken($user_id, $role) {
        $issued_at = time();
        $expiration = $issued_at + (60 * 60 * 24); // 24 hours

        $payload = array(
            'iat' => $issued_at,
            'exp' => $expiration,
            'user_id' => $user_id,
            'role' => $role
        );

        return jwt_encode($payload, self::$secret_key, self::$algorithm);
    }

    public static function validateToken($token) {
        try {
            $decoded = jwt_decode($token, self::$secret_key, array(self::$algorithm));
            return $decoded;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function getAuthorizationHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        return $headers;
    }

    public static function getBearerToken() {
        $headers = self::getAuthorizationHeader();
        
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
} 