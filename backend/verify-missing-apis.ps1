$base = 'http://localhost:5000'
$ts = (Get-Date).ToString('yyyyMMddHHmmss')
$userEmail = "user.$ts@example.com"
$adminEmail = "admin.$ts@example.com"
$userPass = 'Password123'
$resetPass = 'Password456'
$finalPass = 'Password789'
$adminPass = 'Password123'

function Invoke-Json {
    param(
        [string]$Method,
        [string]$Uri,
        [object]$Body,
        [hashtable]$Headers = @{}
    )

    $params = @{
        Method = $Method
        Uri = $Uri
        ContentType = 'application/json'
    }

    if ($Headers.Count -gt 0) {
        $params.Headers = $Headers
    }

    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Compress)
    }

    return Invoke-RestMethod @params
}

try {
    Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/register" -Body @{name='User Audit'; email=$userEmail; password=$userPass; role='user'} | Out-Null
} catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw $_ }
}

try {
    Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/register" -Body @{name='Admin Audit'; email=$adminEmail; password=$adminPass; role='admin'} | Out-Null
} catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw $_ }
}

$forgotResp = Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/forgot-password" -Body @{email=$userEmail}
$forgotToken = $forgotResp.data.resetToken

$resetResp = Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/reset-password" -Body @{token=$forgotToken; newPassword=$resetPass}

$userLogin = Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/login" -Body @{email=$userEmail; password=$resetPass}
$userToken = $userLogin.data.token

$changeResp = Invoke-Json -Method 'POST' -Uri "$base/api/v1/users/change-password" -Body @{currentPassword=$resetPass; newPassword=$finalPass} -Headers @{Authorization="Bearer $userToken"}

$finalLogin = Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/login" -Body @{email=$userEmail; password=$finalPass}

$adminLogin = Invoke-Json -Method 'POST' -Uri "$base/api/v1/auth/login" -Body @{email=$adminEmail; password=$adminPass}
$adminToken = $adminLogin.data.token

$logsResp = Invoke-Json -Method 'GET' -Uri "$base/api/admin/audit-logs" -Headers @{Authorization="Bearer $adminToken"}
$deleteResp = Invoke-Json -Method 'DELETE' -Uri "$base/api/v1/users" -Headers @{Authorization="Bearer $finalLogin.data.token"}

Write-Output "FORGOT_SUCCESS=$($forgotResp.success)"
Write-Output "RESET_SUCCESS=$($resetResp.success)"
Write-Output "CHANGE_SUCCESS=$($changeResp.success)"
Write-Output "DELETE_SUCCESS=$($deleteResp.success)"
Write-Output "AUDIT_COUNT=$($logsResp.data.logs.Count)"
Write-Output "AUDIT_SAMPLE_ACTION=$($logsResp.data.logs[0].action)"
Write-Output "AUDIT_SAMPLE_ENTITY=$($logsResp.data.logs[0].entity)"
