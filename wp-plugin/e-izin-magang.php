<?php
/**
 * Plugin Name: E-Izin Magang App
 * Description: Aplikasi E-Izin Magang berbasis React dengan Database SQL Custom.
 * Version: 2.1
 * Author: Agil
 */

// --- 1. Database Installation ---
register_activation_hook(__FILE__, 'e_izin_install');

function e_izin_install()
{
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Table: Users (Custom Table for app users, separated from WP Users for simplicity as req)
    $table_users = $wpdb->prefix . 'eizin_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        username varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        role varchar(50) NOT NULL,
        code varchar(50) NOT NULL,
        email varchar(255) DEFAULT '',
        phone varchar(50) DEFAULT '',
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // Table: Requests
    $table_requests = $wpdb->prefix . 'eizin_requests';
    $sql_requests = "CREATE TABLE $table_requests (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        student_id bigint(20) NOT NULL,
        type varchar(50) NOT NULL,
        start_date date NOT NULL,
        end_date date NOT NULL,
        reason text NOT NULL,
        attachment_url varchar(255) DEFAULT NULL,
        lecturer_status varchar(50) DEFAULT 'Pending',
        mentor_status varchar(50) DEFAULT 'Pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    // Table: Mappings (Plotting)
    $table_mappings = $wpdb->prefix . 'eizin_mappings';
    $sql_mappings = "CREATE TABLE $table_mappings (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        student_id bigint(20) NOT NULL,
        lecturer_id bigint(20) DEFAULT NULL,
        mentor_id bigint(20) DEFAULT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY student_id (student_id)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql_users);
    dbDelta($sql_requests);
    dbDelta($sql_mappings);

    // Seed Admin User if not exists
    $admin_exist = $wpdb->get_var("SELECT COUNT(*) FROM $table_users WHERE role = 'admin'");
    if ($admin_exist == 0) {
        $wpdb->insert($table_users, array(
            'name' => 'Administrator',
            'username' => 'admin',
            'password' => 'admin', // In real world use hashing! For this MVP we keep plain as per previous logic
            'role' => 'admin',
            'code' => 'ADMIN'
        ));
    }
}

// --- 2. Enqueue Assets ---
function e_izin_enqueue_scripts()
{
    $js_files = glob(plugin_dir_path(__FILE__) . 'assets/*.js');
    $css_files = glob(plugin_dir_path(__FILE__) . 'assets/*.css');

    if (!empty($js_files)) {
        $js_file = basename($js_files[0]);
        wp_enqueue_script('e-izin-react', plugin_dir_url(__FILE__) . 'assets/' . $js_file, array(), '2.1', true);

        // Pass API URL to React
        wp_localize_script('e-izin-react', 'eIzinSettings', array(
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest')
        ));
    }

    if (!empty($css_files)) {
        $css_file = basename($css_files[0]);
        wp_enqueue_style('e-izin-style', plugin_dir_url(__FILE__) . 'assets/' . $css_file, array(), '2.1');
    }
}
add_action('wp_enqueue_scripts', 'e_izin_enqueue_scripts');
add_action('login_enqueue_scripts', 'e_izin_enqueue_scripts'); // Support if used on login page

function render_e_izin_app()
{
    return '<div id="e-izin-root"></div>';
}
add_shortcode('e_izin_magang', 'render_e_izin_app');

// --- 3. REST API Endpoints ---
add_action('rest_api_init', function () {
    // Namespace
    $ns = 'e-izin/v1';

    // -- USERS --
    register_rest_route($ns, '/users', array(
        'methods' => 'GET',
        'callback' => 'eizin_get_users',
        'permission_callback' => '__return_true'
    ));
    register_rest_route($ns, '/users', array(
        'methods' => 'POST',
        'callback' => 'eizin_create_user',
        'permission_callback' => '__return_true'
    ));
    // Login
    register_rest_route($ns, '/login', array(
        'methods' => 'POST',
        'callback' => 'eizin_handle_login',
        'permission_callback' => '__return_true'
    ));
    // Update User (Edit Profil/Password)
    register_rest_route($ns, '/users/(?P<id>\d+)', array(
        'methods' => 'POST', // Menggunakan POST untuk edit agar sederhana
        'callback' => 'eizin_update_user',
        'permission_callback' => '__return_true'
    ));
    // Delete User
    register_rest_route($ns, '/users/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'eizin_delete_user',
        'permission_callback' => '__return_true'
    ));

    // -- REQUESTS --
    register_rest_route($ns, '/requests', array(
        'methods' => 'GET',
        'callback' => 'eizin_get_requests',
        'permission_callback' => '__return_true'
    ));
    register_rest_route($ns, '/requests', array(
        'methods' => 'POST',
        'callback' => 'eizin_create_request',
        'permission_callback' => '__return_true'
    ));
    register_rest_route($ns, '/requests/action', array(
        'methods' => 'POST',
        'callback' => 'eizin_request_action',
        'permission_callback' => '__return_true'
    ));

    // -- MAPPINGS --
    register_rest_route($ns, '/mappings', array(
        'methods' => 'GET',
        'callback' => 'eizin_get_mappings',
        'permission_callback' => '__return_true'
    ));
    register_rest_route($ns, '/mappings', array(
        'methods' => 'POST',
        'callback' => 'eizin_update_mapping',
        'permission_callback' => '__return_true'
    ));
});

// --- API Callback Functions ---

function eizin_get_users()
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_users';
    $results = $wpdb->get_results("SELECT * FROM $table");
    return $results;
}

function eizin_create_user($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_users';
    $params = $request->get_json_params();

    $wpdb->insert($table, array(
        'name' => $params['name'],
        'username' => $params['username'],
        'password' => $params['password'],
        'role' => $params['role'],
        'code' => $params['code'],
        'email' => isset($params['email']) ? $params['email'] : '',
        'phone' => isset($params['phone']) ? $params['phone'] : ''
    ));
    return array('id' => $wpdb->insert_id, 'message' => 'User Created');
}

function eizin_update_user($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_users';
    $id = $request['id'];
    $params = $request->get_json_params();

    // Build update array based on what's provided
    $update_data = array();
    if (isset($params['name']))
        $update_data['name'] = $params['name'];
    if (isset($params['email']))
        $update_data['email'] = $params['email'];
    if (isset($params['phone']))
        $update_data['phone'] = $params['phone'];
    if (isset($params['password']) && !empty($params['password']))
        $update_data['password'] = $params['password'];

    if (!empty($update_data)) {
        $wpdb->update($table, $update_data, array('id' => $id));
    }

    $updated_user = $wpdb->get_row("SELECT * FROM $table WHERE id = $id");
    return $updated_user;
}

function eizin_delete_user($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_users';
    $table_map = $wpdb->prefix . 'eizin_mappings';
    $id = $request['id'];

    $wpdb->delete($table, array('id' => $id));
    $wpdb->delete($table_map, array('student_id' => $id)); // Cleanup mapping

    return array('message' => 'User Deleted');
}


function eizin_handle_login($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_users';
    $params = $request->get_json_params();
    $id_input = $params['identifier'];
    $pass_input = $params['password'];

    // Secure enough for this scope? Warning: Not using Hash!
    // Safe SQL usage via prepare needed in real app, but here simple logic applies
    // Just fetching all matching username/code then filtering in PHP for simplicity or direct SQL query

    $user = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table WHERE (username = %s OR code = %s OR email = %s) AND password = %s",
        $id_input,
        $id_input,
        $id_input,
        $pass_input
    ));

    if ($user) {
        return $user;
    } else {
        return new WP_Error('invalid_login', 'Invalid credentials', array('status' => 401));
    }
}

function eizin_get_requests()
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_requests';
    $table_users = $wpdb->prefix . 'eizin_users';

    // Join to get student name/nim if needed, but for now we stored everything or just IDs?
    // In our React App we stored studentName and NIM directly in request for history preservation. 
    // But normalized DB usually joins. 
    // Let's JOIN to match the React State structure expected:
    // React Request Object: {id, studentName, nim, type, startDate, endDate, reason, lecturerStatus, mentorStatus...}

    $sql = "SELECT r.id, r.type, r.start_date as startDate, r.end_date as endDate, r.reason, 
            r.attachment_url as attachmentUrl, r.lecturer_status as lecturerStatus, r.mentor_status as mentorStatus,
            u.name as studentName, u.code as nim, u.id as studentId
            FROM $table r
            JOIN $table_users u ON r.student_id = u.id
            ORDER BY r.created_at DESC";

    $results = $wpdb->get_results($sql);
    return $results;
}

function eizin_create_request($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_requests';
    $params = $request->get_json_params();

    $wpdb->insert($table, array(
        'student_id' => $params['studentId'], // React must send this
        'type' => $params['type'],
        'start_date' => $params['startDate'],
        'end_date' => $params['endDate'],
        'reason' => $params['reason'],
        'attachment_url' => isset($params['attachmentUrl']) ? $params['attachmentUrl'] : ''
    ));

    return array('id' => $wpdb->insert_id, 'message' => 'Request Created');
}

function eizin_request_action($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_requests';
    $params = $request->get_json_params();
    $id = $params['id'];
    $role = $params['role']; // 'lecturer' or 'mentor'
    $action = $params['action']; // 'Approved' or 'Rejected'

    $col = ($role === 'lecturer') ? 'lecturer_status' : 'mentor_status';

    $wpdb->update($table, array($col => $action), array('id' => $id));
    return array('message' => 'Status Updated');
}

function eizin_get_mappings()
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_mappings';
    $results = $wpdb->get_results("SELECT * FROM $table");

    // Convert to Object: { studentId: { lecturerId: ..., mentorId: ... } }
    $mapObj = array();
    foreach ($results as $row) {
        $mapObj[$row->student_id] = array(
            'lecturerId' => (int) $row->lecturer_id,
            'mentorId' => (int) $row->mentor_id
        );
    }
    return $mapObj; // Return as object to match React exact structure
}

function eizin_update_mapping($request)
{
    global $wpdb;
    $table = $wpdb->prefix . 'eizin_mappings';
    $params = $request->get_json_params();

    $studentId = $params['studentId'];
    $lecturerId = $params['lecturerId'];
    $mentorId = $params['mentorId'];

    // Check if exists
    $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE student_id = %d", $studentId));

    if ($exists) {
        $wpdb->update($table, array(
            'lecturer_id' => $lecturerId,
            'mentor_id' => $mentorId
        ), array('student_id' => $studentId));
    } else {
        $wpdb->insert($table, array(
            'student_id' => $studentId,
            'lecturer_id' => $lecturerId,
            'mentor_id' => $mentorId
        ));
    }

    return array('message' => 'Mapping Updated');
}
