$directory = "C:\Projects01\WorkSphere\frontend\worksphere-frontend"
$files = Get-ChildItem -Path $directory -Filter *.html

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # Fix Departments
    $content = [regex]::Replace($content, 'href="#"( class="nav-item[^"]*"><i class="[^"]*"></i>\s*Departments)', 'href="departments.html"$1')
    
    # Fix Settings
    $content = [regex]::Replace($content, 'href="#"( class="nav-item[^"]*"><i class="[^"]*"></i>\s*Settings)', 'href="settings.html"$1')

    if ($content -cne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.Name)"
    }
}
