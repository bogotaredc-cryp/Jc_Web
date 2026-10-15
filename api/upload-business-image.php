
<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['success' => false, 'message' => 'Método no permitido.']);
}

// Solo aceptar peticiones desde el sitio principal.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';

$allowedHost = 'josecuestanovoa.com';
$originHost = $origin ? parse_url($origin, PHP_URL_HOST) : null;
$refererHost = $referer ? parse_url($referer, PHP_URL_HOST) : null;

if (
    ($originHost && !in_array($originHost, [$allowedHost, 'www.' . $allowedHost], true)) ||
    (!$originHost && $refererHost && !in_array($refererHost, [$allowedHost, 'www.' . $allowedHost], true)) ||
    (!$originHost && !$refererHost)
) {
    respond(403, ['success' => false, 'message' => 'Origen no permitido.']);
}

if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
    respond(400, ['success' => false, 'message' => 'No se recibió ninguna imagen.']);
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    respond(400, ['success' => false, 'message' => 'Error al recibir el archivo.']);
}

$maxSize = 5 * 1024 * 1024;

if ($file['size'] <= 0 || $file['size'] > $maxSize) {
    respond(400, ['success' => false, 'message' => 'La imagen debe pesar máximo 5 MB.']);
}

if (!is_uploaded_file($file['tmp_name'])) {
    respond(400, ['success' => false, 'message' => 'Archivo no válido.']);
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!isset($allowedTypes[$mime])) {
    respond(415, ['success' => false, 'message' => 'Usa JPG, PNG o WebP.']);
}

// Comprobar que el archivo sea realmente una imagen.
$imageInfo = @getimagesize($file['tmp_name']);

if (
    $imageInfo === false ||
    $imageInfo[0] > 8000 ||
    $imageInfo[1] > 8000 ||
    ($imageInfo['mime'] ?? '') !== $mime
) {
    respond(415, ['success' => false, 'message' => 'La imagen no es válida.']);
}

$uploadDir = dirname(__DIR__) . '/uploads/negocios/';

if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
    respond(500, ['success' => false, 'message' => 'La carpeta de imágenes no está disponible.']);
}

$fileName = bin2hex(random_bytes(16)) . '.' . $allowedTypes[$mime];
$destination = $uploadDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    respond(500, ['success' => false, 'message' => 'No se pudo guardar la imagen.']);
}

$imageUrl = 'https://josecuestanovoa.com/uploads/negocios/' . $fileName;

respond(200, [
    'success' => true,
    'url' => $imageUrl,
    'path' => 'uploads/negocios/' . $fileName
]);
