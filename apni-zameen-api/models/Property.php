<?php
class Property {
    private $conn;
    private $table_name = "properties";

    public $id;
    public $title;
    public $description;
    public $price;
    public $property_type;
    public $status;
    public $bedrooms;
    public $bathrooms;
    public $area;
    public $address;
    public $city;
    public $state;
    public $zip_code;
    public $features;
    public $agent_id;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT p.*, u.username as agent_name 
                FROM " . $this->table_name . " p
                LEFT JOIN users u ON p.agent_id = u.id
                ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function readOne() {
        $query = "SELECT p.*, u.username as agent_name 
                FROM " . $this->table_name . " p
                LEFT JOIN users u ON p.agent_id = u.id
                WHERE p.id = ?
                LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->price = $row['price'];
            $this->property_type = $row['property_type'];
            $this->status = $row['status'];
            $this->bedrooms = $row['bedrooms'];
            $this->bathrooms = $row['bathrooms'];
            $this->area = $row['area'];
            $this->address = $row['address'];
            $this->city = $row['city'];
            $this->state = $row['state'];
            $this->zip_code = $row['zip_code'];
            $this->features = $row['features'];
            $this->agent_id = $row['agent_id'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return $row;
        }

        return false;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    title = :title,
                    description = :description,
                    price = :price,
                    property_type = :property_type,
                    status = :status,
                    bedrooms = :bedrooms,
                    bathrooms = :bathrooms,
                    area = :area,
                    address = :address,
                    city = :city,
                    state = :state,
                    zip_code = :zip_code,
                    features = :features,
                    agent_id = :agent_id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->property_type = htmlspecialchars(strip_tags($this->property_type));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->bedrooms = htmlspecialchars(strip_tags($this->bedrooms));
        $this->bathrooms = htmlspecialchars(strip_tags($this->bathrooms));
        $this->area = htmlspecialchars(strip_tags($this->area));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->state = htmlspecialchars(strip_tags($this->state));
        $this->zip_code = htmlspecialchars(strip_tags($this->zip_code));
        $this->features = htmlspecialchars(strip_tags($this->features));
        $this->agent_id = htmlspecialchars(strip_tags($this->agent_id));

        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":property_type", $this->property_type);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":bedrooms", $this->bedrooms);
        $stmt->bindParam(":bathrooms", $this->bathrooms);
        $stmt->bindParam(":area", $this->area);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":state", $this->state);
        $stmt->bindParam(":zip_code", $this->zip_code);
        $stmt->bindParam(":features", $this->features);
        $stmt->bindParam(":agent_id", $this->agent_id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    title = :title,
                    description = :description,
                    price = :price,
                    property_type = :property_type,
                    status = :status,
                    bedrooms = :bedrooms,
                    bathrooms = :bathrooms,
                    area = :area,
                    address = :address,
                    city = :city,
                    state = :state,
                    zip_code = :zip_code,
                    features = :features
                WHERE
                    id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->property_type = htmlspecialchars(strip_tags($this->property_type));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->bedrooms = htmlspecialchars(strip_tags($this->bedrooms));
        $this->bathrooms = htmlspecialchars(strip_tags($this->bathrooms));
        $this->area = htmlspecialchars(strip_tags($this->area));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->state = htmlspecialchars(strip_tags($this->state));
        $this->zip_code = htmlspecialchars(strip_tags($this->zip_code));
        $this->features = htmlspecialchars(strip_tags($this->features));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind values
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":property_type", $this->property_type);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":bedrooms", $this->bedrooms);
        $stmt->bindParam(":bathrooms", $this->bathrooms);
        $stmt->bindParam(":area", $this->area);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":state", $this->state);
        $stmt->bindParam(":zip_code", $this->zip_code);
        $stmt->bindParam(":features", $this->features);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?> 